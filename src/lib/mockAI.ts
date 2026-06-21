import { InterviewType, QuestionAnalysis, InterviewFeedback, Emotion } from '../types';

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(base: number, variance: number): number {
  const val = base + (Math.random() - 0.5) * variance * 2;
  return Math.max(0, Math.min(100, Math.round(val)));
}

const fillerWordSets = [
  ['um', 'uh', 'like', 'you know'],
  ['basically', 'literally', 'actually', 'so'],
  ['right', 'okay', 'yeah', 'kind of'],
  ['um', 'uh', 'sort of'],
];

const emotionPool: Emotion[] = ['confident', 'neutral', 'engaged', 'nervous', 'stressed'];

const relevanceComments = [
  'Your answer addressed the core aspects of the question with reasonable depth. The examples you provided were pertinent to the topic.',
  'You demonstrated a solid understanding of the question. Some parts of your answer could be more directly tied to the specific question asked.',
  'The response showed good awareness of the topic. Expanding on the direct relationship between your examples and the question would strengthen relevance.',
  'Your answer was highly relevant and directly addressed what was asked. The connection between your experience and the question was clear.',
  'You touched on several relevant points, though the response drifted slightly from the core question at times.',
];

const clarityComments = [
  'Your communication was clear and easy to follow. The logical flow helped convey your message effectively.',
  'The response had good clarity overall. Using more specific examples would make your points even more concrete.',
  'Your ideas came through, though some transitions between points could be smoother to improve overall clarity.',
  'Very clear and well-articulated response. Your vocabulary choices were precise and professional.',
  'The core message was communicated effectively. Reducing filler language would further enhance clarity.',
];

const structureComments = [
  'Your answer followed a clear structure. The STAR method (Situation, Task, Action, Result) was naturally embedded in your response.',
  'The response was well-organized with a clear beginning, middle, and end. A brief summary at the close would reinforce the structure.',
  'You presented your points in a logical sequence. Adding more explicit transitions would strengthen the overall structure.',
  'Good structural foundation. The response would benefit from a brief opening that frames your answer before diving into details.',
  'The answer had a natural flow. Breaking it into more distinct sections would make it even easier to follow.',
];

const toneOptions = ['confident', 'measured', 'enthusiastic', 'calm', 'professional', 'assertive'];
const eyeContactOptions = ['strong', 'good', 'moderate', 'inconsistent'];
const postureOptions = ['excellent', 'upright', 'relaxed', 'attentive'];

function generateSuggestions(type: InterviewType, scores: { confidence: number; communication: number; technical: number }): string[] {
  const allSuggestions: Record<InterviewType, string[]> = {
    technical: [
      'Structure your technical explanations using the Pyramid Principle: lead with the conclusion, then provide supporting details.',
      'When describing system design, always mention scalability considerations and potential bottlenecks.',
      'Use concrete metrics and numbers to quantify the impact of your technical decisions.',
      'Practice explaining complex concepts using analogies that non-technical stakeholders can relate to.',
      'When discussing trade-offs, always acknowledge the constraints that influenced your decision.',
      'Demonstrate awareness of alternative approaches before justifying your chosen solution.',
      'Include mention of testing strategies when discussing your implementation approach.',
      'Reference real-world use cases or industry examples to ground your technical answers.',
    ],
    hr: [
      'Use the STAR method consistently: Situation, Task, Action, Result for behavioral questions.',
      'Quantify your achievements wherever possible — numbers make your impact tangible and memorable.',
      'Research the company values and weave relevant alignment into your answers naturally.',
      'When discussing challenges, spend more time on the actions you took and lessons learned than on the problem itself.',
      'Practice storytelling — your answers should have a clear narrative arc that keeps the interviewer engaged.',
      'Prepare 3-4 strong stories that can be adapted to different question types.',
      'Show self-awareness by acknowledging areas for growth alongside your strengths.',
      'Connect your personal goals to the company\'s mission to demonstrate genuine interest.',
    ],
    behavioral: [
      'Use specific, recent examples — vague or generic answers are harder to evaluate positively.',
      'Always close your behavioral answers with the result and what you learned from the experience.',
      'Demonstrate self-reflection by explaining what you would do differently in retrospect.',
      'When describing team achievements, clearly articulate your specific contribution.',
      'Use "I" statements to take ownership of your actions rather than attributing everything to the team.',
      'Prepare examples that show a range of emotions and contexts — versatility is impressive.',
      'Avoid hypothetical answers — interviewers want to know what you actually did.',
      'Show emotional intelligence by acknowledging the perspective of others in your examples.',
    ],
    communication: [
      'Open your answers with a clear thesis statement before supporting details.',
      'Practice the "Rule of Three" — organize your main points into three clear categories.',
      'Use bridging techniques to transition smoothly between different aspects of your answer.',
      'Modulate your speaking pace — slow down for key points and speed up for background context.',
      'Use intentional pauses for emphasis rather than filling silence with filler words.',
      'Match your energy and vocabulary to the formality level of the conversation.',
      'Actively demonstrate listening by referencing what the interviewer said in your response.',
      'Use inclusive language and collaborative framing to demonstrate strong interpersonal communication.',
    ],
  };

  const suggestions = allSuggestions[type];
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);

  const count = scores.communication < 65 ? 5 : scores.confidence < 65 ? 4 : 3;
  return shuffled.slice(0, count);
}

function generateImprovedAnswer(question: string, transcript: string, type: InterviewType): string {
  const prefixes = {
    technical: 'Drawing on my experience, I would approach this by first identifying the core requirements and constraints. ',
    hr: 'This is a great example that shaped my professional development. In that situation, ',
    behavioral: 'That experience was a defining moment for me. To give you the full context — ',
    communication: 'I approach this with intention and structure. Specifically, ',
  };

  const closings = {
    technical: ' This approach consistently delivers maintainable, scalable solutions that meet both current and future requirements.',
    hr: ' That experience taught me the importance of combining strategic thinking with empathetic leadership.',
    behavioral: ' Looking back, it reinforced how proactive communication and ownership are critical to delivering results under pressure.',
    communication: ' I find this approach creates clarity, builds trust, and ensures all stakeholders feel heard and aligned.',
  };

  const wordCount = transcript.split(' ').length;
  const isShort = wordCount < 50;

  if (isShort) {
    return `${prefixes[type]}${transcript.charAt(0).toUpperCase() + transcript.slice(1)}. I would further strengthen this response by elaborating on the specific context, the measurable outcome, and what I would refine if given the opportunity again.${closings[type]}`;
  }

  return `${prefixes[type]}${transcript.charAt(0).toUpperCase() + transcript.slice(1)}${closings[type]}`;
}

export function analyzeQuestion(
  question: string,
  transcript: string,
  type: InterviewType
): QuestionAnalysis {
  const wordCount = transcript.split(' ').filter(Boolean).length;
  const baseScore = wordCount < 20 ? 45 : wordCount < 50 ? 60 : wordCount < 100 ? 72 : 80;

  return {
    question,
    transcript,
    scores: {
      relevance: weightedRandom(baseScore, 12),
      clarity: weightedRandom(baseScore - 3, 12),
      structure: weightedRandom(baseScore - 5, 15),
      depth: weightedRandom(baseScore - 8, 15),
    },
    improved_answer: generateImprovedAnswer(question, transcript, type),
    key_points_missed: [
      'Specific quantifiable outcomes',
      'Context and background setting',
      'Reflection on lessons learned',
    ].slice(0, randomInRange(1, 3)),
  };
}

export function generateFullFeedback(
  interviewType: InterviewType,
  answers: Array<{ question: string; transcript: string }>,
  duration: number
): Omit<InterviewFeedback, 'id' | 'interview_id' | 'user_id' | 'created_at'> {
  const questionFeedback = answers.map(({ question, transcript }) =>
    analyzeQuestion(question, transcript, interviewType)
  );

  const avgRelevance = questionFeedback.reduce((s, q) => s + q.scores.relevance, 0) / questionFeedback.length;
  const avgClarity = questionFeedback.reduce((s, q) => s + q.scores.clarity, 0) / questionFeedback.length;
  const avgStructure = questionFeedback.reduce((s, q) => s + q.scores.structure, 0) / questionFeedback.length;
  const avgDepth = questionFeedback.reduce((s, q) => s + q.scores.depth, 0) / questionFeedback.length;

  const totalWords = answers.reduce((s, a) => s + a.transcript.split(' ').filter(Boolean).length, 0);
  const wpm = duration > 0 ? Math.round((totalWords / duration) * 60) : randomInRange(100, 160);
  const fillerWordSet = fillerWordSets[randomInRange(0, fillerWordSets.length - 1)];
  const fillerCount = randomInRange(2, 12);

  const confidence = weightedRandom(Math.round((avgDepth + avgStructure) / 2), 10);
  const communication = weightedRandom(Math.round((avgClarity + avgRelevance) / 2), 8);
  const technical = interviewType === 'technical' ? weightedRandom(Math.round((avgDepth + avgRelevance) / 2), 12) : weightedRandom(60, 15);
  const overall = Math.round((confidence + communication + technical) / 3);

  const emotion: Emotion = confidence > 75 ? 'confident' : confidence > 60 ? 'neutral' : 'nervous';
  const engagementScore = weightedRandom(72, 15);

  return {
    confidence_score: confidence,
    communication_score: communication,
    technical_score: technical,
    overall_score: overall,
    analysis: {
      relevance: relevanceComments[randomInRange(0, relevanceComments.length - 1)],
      clarity: clarityComments[randomInRange(0, clarityComments.length - 1)],
      structure: structureComments[randomInRange(0, structureComments.length - 1)],
      strengths: [
        'Clear communication of key ideas',
        'Professional and composed demeanor',
        'Good use of specific examples',
        'Demonstrates genuine enthusiasm',
        'Thoughtful and measured responses',
      ].sort(() => Math.random() - 0.5).slice(0, 3),
      weaknesses: [
        'Could provide more quantifiable outcomes',
        'Occasional use of filler words',
        'Some answers lacked clear conclusion',
        'More depth on decision rationale would strengthen responses',
        'Inconsistent pacing during longer answers',
      ].sort(() => Math.random() - 0.5).slice(0, 2),
    },
    voice_metrics: {
      speed: wpm > 160 ? 'fast' : wpm < 110 ? 'slow' : 'optimal',
      words_per_minute: wpm,
      filler_words: fillerCount,
      filler_word_list: fillerWordSet.slice(0, Math.min(fillerCount, fillerWordSet.length)),
      tone: toneOptions[randomInRange(0, toneOptions.length - 1)],
      pause_count: randomInRange(3, 15),
    },
    behavior_metrics: {
      eye_contact: eyeContactOptions[randomInRange(0, eyeContactOptions.length - 1)],
      emotion,
      posture: postureOptions[randomInRange(0, postureOptions.length - 1)],
      engagement_score: engagementScore,
    },
    suggestions: generateSuggestions(interviewType, { confidence, communication, technical }),
    question_feedback: questionFeedback,
  };
}

export function generateLiveBehaviorUpdate(): { emotion: Emotion; eyeContact: number; confidence: number } {
  const rand = Math.random();
  let emotion: Emotion;
  if (rand > 0.6) emotion = 'confident';
  else if (rand > 0.4) emotion = 'neutral';
  else if (rand > 0.25) emotion = 'engaged';
  else if (rand > 0.1) emotion = 'nervous';
  else emotion = 'stressed';

  return {
    emotion,
    eyeContact: randomInRange(55, 95),
    confidence: randomInRange(45, 92),
  };
}
