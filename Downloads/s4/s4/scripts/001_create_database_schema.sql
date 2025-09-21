-- Create projects table to store analyzed websites
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create test_results table to store blackbox testing results
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('accessibility', 'performance', 'seo', 'security', 'functionality', 'ui_ux')),
  page_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'warning')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  issues JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_analysis table to store AI-generated market insights
CREATE TABLE IF NOT EXISTS market_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('competitor', 'target_audience', 'market_size', 'pricing', 'features')),
  insights JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create qa_sessions table to store user questions and AI responses
CREATE TABLE IF NOT EXISTS qa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create crawl_data table to store scraped website information
CREATE TABLE IF NOT EXISTS crawl_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  content_text TEXT,
  html_content TEXT,
  images JSONB DEFAULT '[]',
  links JSONB DEFAULT '[]',
  forms JSONB DEFAULT '[]',
  scripts JSONB DEFAULT '[]',
  stylesheets JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for test_results (users can access results for their projects)
CREATE POLICY "Users can view test results for their projects" ON test_results FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = test_results.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "System can create test results" ON test_results FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update test results" ON test_results FOR UPDATE USING (true);

-- Create RLS policies for market_analysis
CREATE POLICY "Users can view market analysis for their projects" ON market_analysis FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = market_analysis.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "System can create market analysis" ON market_analysis FOR INSERT WITH CHECK (true);

-- Create RLS policies for qa_sessions
CREATE POLICY "Users can view their own QA sessions" ON qa_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own QA sessions" ON qa_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for crawl_data
CREATE POLICY "Users can view crawl data for their projects" ON crawl_data FOR SELECT 
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = crawl_data.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "System can create crawl data" ON crawl_data FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_test_results_project_id ON test_results(project_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_market_analysis_project_id ON market_analysis(project_id);
CREATE INDEX idx_qa_sessions_project_id ON qa_sessions(project_id);
CREATE INDEX idx_qa_sessions_user_id ON qa_sessions(user_id);
CREATE INDEX idx_crawl_data_project_id ON crawl_data(project_id);
