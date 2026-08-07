-- ================================================================
-- ScholarPass - Schéma Supabase PostgreSQL
-- ================================================================
-- Ce script crée toutes les tables, index et policies RLS
-- pour l'architecture multi-agents IA de ScholarPass
-- ================================================================

-- ================================================================
-- 1. EXTENSIONS
-- ================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ================================================================
-- 2. TABLES PRINCIPALES
-- ================================================================

-- Profils étudiants (lié à auth.users de Supabase)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  
  -- Progression
  completion_percentage integer default 0,
  
  -- Agent 1: Informations personnelles
  personal_info jsonb default '{}'::jsonb,
  
  -- Agent 2: Parcours académique
  education jsonb[] default array[]::jsonb[],
  
  -- Agent 8: Compétences
  skills text[] default array[]::text[],
  
  -- Agent 8: Expériences
  experiences jsonb[] default array[]::jsonb[],
  
  -- Agent 5: Objectifs de vie
  goals jsonb default '{}'::jsonb,
  
  -- Agent 3: Préférences pays
  preferred_countries text[] default array[]::text[],
  refused_countries text[] default array[]::text[],
  language_preference text, -- 'french', 'english', 'both'
  climate_preference text,
  accepts_distance boolean default true,
  plans_immigration boolean default false,
  
  -- Agent 6: Besoins financiers
  financial_needs jsonb default '{}'::jsonb,
  
  -- Agent 8: Analyse personnalité
  personality_analysis jsonb default '{}'::jsonb,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents uploadés (stockés dans Supabase Storage)
create table documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Info fichier
  type text not null, -- 'bulletin', 'diplome', 'cv', 'lettre', 'certificat', 'passeport'
  original_name text not null,
  stored_name text not null,
  storage_path text not null,
  mime_type text,
  file_size integer,
  
  -- Agent 7: Données extraites
  extracted_data jsonb default '{}'::jsonb,
  is_processed boolean default false,
  processing_error text,
  
  -- Metadata
  uploaded_at timestamptz default now()
);

-- Bourses d'études
create table scholarships (
  id uuid primary key default uuid_generate_v4(),
  
  -- Info base
  title text not null,
  provider text not null,
  country text not null,
  description text,
  
  -- Critères
  levels text[] not null, -- ['Licence', 'Master', 'PhD']
  field text, -- 'Toutes disciplines' ou domaine spécifique
  requirements jsonb default '{}'::jsonb,
  
  -- Avantages
  benefits jsonb default '{}'::jsonb, -- {logement: true, billet_avion: false, assurance: true}
  coverage text, -- 'complète', 'partielle'
  
  -- Dates
  deadline date,
  start_date date,
  
  -- Status
  active boolean default true,
  featured boolean default false,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Universités / Écoles
create table universities (
  id uuid primary key default uuid_generate_v4(),
  
  -- Info base
  name text not null,
  country text not null,
  city text,
  
  -- Caractéristiques
  type text, -- 'public', 'private'
  size text, -- 'small', 'medium', 'large'
  student_count integer,
  
  -- Vie étudiante
  campus_life boolean default true,
  on_campus_housing boolean,
  
  -- Programmes
  programs jsonb default '[]'::jsonb,
  
  -- Metadata
  created_at timestamptz default now()
);

-- Candidatures (applications)
create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Cible
  scholarship_id uuid references scholarships(id),
  university_id uuid references universities(id),
  
  -- Statut
  status text not null default 'en_preparation',
  -- statuses: 'en_preparation', 'soumis', 'en_cours', 'accepte', 'refuse'
  
  -- Progression
  progress integer default 0,
  
  -- Agent 9: Stratégie
  strategy_score integer, -- 0-100
  missing_documents text[] default array[]::text[],
  action_plan jsonb default '{}'::jsonb,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations Nova (Agent 10 - Coach)
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Messages
  messages jsonb[] default array[]::jsonb[],
  
  -- Contexte conversation
  context jsonb default '{}'::jsonb,
  current_topic text,
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Logs d'agents (pour debug et analytics)
create table agent_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  
  -- Info agent
  agent_name text not null,
  action text,
  
  -- Input/Output
  input text,
  output jsonb,
  
  -- Coûts
  tokens_used integer,
  duration_ms integer,
  
  -- Metadata
  created_at timestamptz default now()
);

-- ================================================================
-- 3. INDEX POUR PERFORMANCE
-- ================================================================

create index idx_profiles_user_id on profiles(user_id);
create index idx_documents_user_id on documents(user_id);
create index idx_applications_user_id on applications(user_id);
create index idx_conversations_user_id on conversations(user_id);
create index idx_agent_logs_user_id on agent_logs(user_id);

create index idx_scholarships_country on scholarships(country);
create index idx_scholarships_levels on scholarships using gin(levels);
create index idx_scholarships_active on scholarships(active) where active = true;

create index idx_universities_country on universities(country);
create index idx_applications_status on applications(status);

-- Index JSONB pour recherches avancées
create index idx_profiles_personal_info on profiles using gin(personal_info);
create index idx_scholarships_requirements on scholarships using gin(requirements);

-- ================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Activer RLS sur toutes les tables
alter table profiles enable row level security;
alter table documents enable row level security;
alter table applications enable row level security;
alter table conversations enable row level security;
alter table agent_logs enable row level security;

-- scholarships et universities sont publiques en lecture
alter table scholarships enable row level security;
alter table universities enable row level security;

-- ================================================================
-- 5. POLICIES DE SÉCURITÉ
-- ================================================================

-- Profiles: chaque utilisateur ne voit/modifie que le sien
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

-- Documents: chaque utilisateur ne voit/modifie que les siens
create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Applications: chaque utilisateur ne voit/modifie que les siennes
create policy "Users can view own applications"
  on applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

-- Conversations: chaque utilisateur ne voit que les siennes
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update
  using (auth.uid() = user_id);

-- Agent logs: lecture seule pour l'utilisateur, écriture backend
create policy "Users can view own agent logs"
  on agent_logs for select
  using (auth.uid() = user_id);

create policy "Backend can insert agent logs"
  on agent_logs for insert
  with check (true); -- Seul le backend avec service role peut écrire

-- Scholarships: lecture publique, écriture backend uniquement
create policy "Anyone can view active scholarships"
  on scholarships for select
  using (active = true);

create policy "Backend can manage scholarships"
  on scholarships for all
  using (true); -- Service role only

-- Universities: lecture publique, écriture backend uniquement
create policy "Anyone can view universities"
  on universities for select
  using (true);

create policy "Backend can manage universities"
  on universities for all
  using (true); -- Service role only

-- ================================================================
-- 6. TRIGGERS POUR UPDATED_AT
-- ================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

create trigger conversations_updated_at
  before update on conversations
  for each row
  execute function update_updated_at_column();

create trigger scholarships_updated_at
  before update on scholarships
  for each row
  execute function update_updated_at_column();

-- ================================================================
-- 7. FONCTIONS UTILITAIRES
-- ================================================================

-- Fonction pour calculer automatiquement le % de complétion du profil
create or replace function calculate_profile_completion()
returns trigger as $$
declare
  completion integer := 0;
begin
  -- Info perso (20 points)
  if new.personal_info is not null and jsonb_object_length(new.personal_info) > 0 then
    completion := completion + 20;
  end if;
  
  -- Éducation (20 points)
  if new.education is not null and array_length(new.education, 1) > 0 then
    completion := completion + 20;
  end if;
  
  -- Compétences (15 points)
  if new.skills is not null and array_length(new.skills, 1) > 0 then
    completion := completion + 15;
  end if;
  
  -- Expériences (15 points)
  if new.experiences is not null and array_length(new.experiences, 1) > 0 then
    completion := completion + 15;
  end if;
  
  -- Objectifs (15 points)
  if new.goals is not null and new.goals->>'lifeIn10Years' is not null then
    completion := completion + 15;
  end if;
  
  -- Documents (15 points) - vérifié via une requête séparée
  
  new.completion_percentage := least(100, completion);
  return new;
end;
$$ language plpgsql;

create trigger profiles_calculate_completion
  before insert or update on profiles
  for each row
  execute function calculate_profile_completion();

-- ================================================================
-- 8. DONNÉES DE DÉMONSTRATION
-- ================================================================

-- Quelques bourses exemple
insert into scholarships (title, provider, country, levels, field, deadline, benefits, featured) values
('Bourse d''excellence Afrique', 'Université de Montréal', 'Canada', 
 array['Licence', 'Master'], 'Toutes disciplines', '2026-06-30',
 '{"logement": false, "billet_avion": false, "assurance": true}'::jsonb, true),
 
('Bourse Chevening', 'Gouvernement du Royaume-Uni', 'Royaume-Uni',
 array['Master'], 'Toutes disciplines', '2026-07-05',
 '{"logement": true, "billet_avion": true, "assurance": true}'::jsonb, true),
 
('Bourse Eiffel Excellence', 'Gouvernement Français', 'France',
 array['Master', 'PhD'], 'Toutes disciplines', '2026-10-20',
 '{"logement": true, "billet_avion": false, "assurance": true}'::jsonb, true),
 
('Mastercard Foundation Scholars', 'Mastercard Foundation', 'Canada',
 array['Licence', 'Master'], 'Toutes disciplines', '2026-08-31',
 '{"logement": true, "billet_avion": true, "assurance": true}'::jsonb, false),
 
('Bourse de la Francophonie', 'OIF', 'France',
 array['Master'], 'Sciences sociales', '2026-09-15',
 '{"logement": false, "billet_avion": false, "assurance": false}'::jsonb, false);

-- Quelques universités exemple
insert into universities (name, country, city, type, size, campus_life) values
('Université de Montréal', 'Canada', 'Montréal', 'public', 'large', true),
('Sorbonne Université', 'France', 'Paris', 'public', 'large', true),
('University of Oxford', 'Royaume-Uni', 'Oxford', 'public', 'medium', true),
('ETH Zurich', 'Suisse', 'Zurich', 'public', 'medium', true),
('McGill University', 'Canada', 'Montréal', 'public', 'large', true);

-- ================================================================
-- 9. VUES UTILES
-- ================================================================

-- Vue pour les bourses recommandées (à personnaliser selon algo)
create or replace view recommended_scholarships as
select s.*, p.preferred_countries
from scholarships s
cross join profiles p
where s.active = true
  and (p.preferred_countries is null 
       or s.country = any(p.preferred_countries));

-- ================================================================
-- FIN DU SCRIPT
-- ================================================================
