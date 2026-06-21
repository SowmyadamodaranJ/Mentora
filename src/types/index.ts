export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'communication';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';
export type Emotion = 'confident' | 'nervous' | 'neutral' | 'engaged' | 'stressed';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url: string;
  target_role: string;
  career_level: string;
  interviews_completed: number;
  avg_confidence_score: number;
  avg_communication_score: number;
  avg_technical_score: number;
  created_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  type: InterviewType;
  role: string;
  difficulty: Difficulty;
  status: InterviewStatus;
  question_count: number;
  duration_seconds: number;
  created_at: string;
  completed_at: string | null;
  interview_feedback?: InterviewFeedback[];
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_text: string;
  question_order: number;
  category: string;
}

export interface InterviewAnswer {
  id: string;
  question_id: string;
  interview_id: string;
  transcript: string;
  duration_seconds: number;
  word_count: number;
}

export interface QuestionAnalysis {
  question: string;
  transcript: string;
  scores: {
    relevance: number;
    clarity: number;
    structure: number;
    depth: number;
  };
  improved_answer: string;
  key_points_missed: string[];
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  user_id: string;
  confidence_score: number;
  communication_score: number;
  technical_score: number;
  overall_score: number;
  analysis: {
    relevance: string;
    clarity: string;
    structure: string;
    strengths: string[];
    weaknesses: string[];
  };
  voice_metrics: {
    speed: string;
    words_per_minute: number;
    filler_words: number;
    filler_word_list: string[];
    tone: string;
    pause_count: number;
  };
  behavior_metrics: {
    eye_contact: string;
    emotion: Emotion;
    posture: string;
    engagement_score: number;
  };
  suggestions: string[];
  question_feedback: QuestionAnalysis[];
  created_at: string;
}

export interface InterviewConfig {
  type: InterviewType;
  role: string;
  difficulty: Difficulty;
  questionCount: number;
  jobDescription?: string;
}

export interface LiveBehaviorData {
  emotion: Emotion;
  eyeContact: number;
  confidence: number;
}

export interface SpeechData {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  wordCount: number;
}

export interface ChartDataPoint {
  date: string;
  confidence: number;
  communication: number;
  technical: number;
  overall: number;
}
