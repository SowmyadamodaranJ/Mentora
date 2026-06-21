import { InterviewType, Difficulty } from '../types';

interface QuestionSet {
  question: string;
  category: string;
}

const technicalQuestions: Record<Difficulty, QuestionSet[]> = {
  easy: [
    { question: 'Can you explain the difference between a stack and a queue?', category: 'data-structures' },
    { question: 'What is the difference between == and === in JavaScript?', category: 'language' },
    { question: 'Explain what an API is and how it works.', category: 'concepts' },
    { question: 'What is version control and why is it important?', category: 'tools' },
    { question: 'Describe the difference between front-end and back-end development.', category: 'concepts' },
    { question: 'What is a database and what are some common types?', category: 'databases' },
    { question: 'Can you explain what HTML, CSS, and JavaScript each do?', category: 'web' },
    { question: 'What is a function and why do we use them in programming?', category: 'programming' },
  ],
  medium: [
    { question: 'Explain the concept of RESTful APIs and their key principles.', category: 'api' },
    { question: 'What is the difference between synchronous and asynchronous programming?', category: 'concepts' },
    { question: 'Describe how you would optimize a slow database query.', category: 'databases' },
    { question: 'Explain the concept of Object-Oriented Programming and its four pillars.', category: 'oop' },
    { question: 'What is the time complexity of common sorting algorithms?', category: 'algorithms' },
    { question: 'How does HTTP differ from HTTPS and why does it matter?', category: 'networking' },
    { question: 'Explain what React hooks are and when you would use them.', category: 'frameworks' },
    { question: 'What is the difference between SQL and NoSQL databases?', category: 'databases' },
    { question: 'How would you handle error management in a production application?', category: 'best-practices' },
    { question: 'Describe the MVC architectural pattern and its benefits.', category: 'architecture' },
  ],
  hard: [
    { question: 'Design a URL shortening service like bit.ly. Walk me through your architecture.', category: 'system-design' },
    { question: 'Explain CAP theorem and how it affects distributed system design.', category: 'distributed-systems' },
    { question: 'How would you implement a rate limiter for an API?', category: 'backend' },
    { question: 'Describe how you would design a real-time chat application at scale.', category: 'system-design' },
    { question: 'Explain the internals of how a JavaScript event loop works.', category: 'language' },
    { question: 'How would you approach migrating a monolith to microservices?', category: 'architecture' },
    { question: 'Describe a consistent hashing algorithm and its use cases.', category: 'algorithms' },
    { question: 'How does garbage collection work and how can memory leaks occur?', category: 'performance' },
    { question: 'Design a notification system that can handle millions of users.', category: 'system-design' },
    { question: 'Explain SOLID principles with real-world examples from your experience.', category: 'best-practices' },
  ],
};

const hrQuestions: Record<Difficulty, QuestionSet[]> = {
  easy: [
    { question: 'Tell me about yourself and your career journey.', category: 'introduction' },
    { question: 'Why are you interested in this position?', category: 'motivation' },
    { question: 'What are your greatest strengths?', category: 'self-assessment' },
    { question: 'Where do you see yourself in 5 years?', category: 'goals' },
    { question: 'Why are you leaving your current job?', category: 'motivation' },
    { question: 'What do you know about our company?', category: 'research' },
    { question: 'What is your expected salary range?', category: 'compensation' },
    { question: 'Do you have any questions for us?', category: 'engagement' },
  ],
  medium: [
    { question: 'Describe a time when you had to work under significant pressure. How did you handle it?', category: 'stress-management' },
    { question: 'Tell me about a conflict you had with a coworker and how you resolved it.', category: 'interpersonal' },
    { question: 'Describe a situation where you failed. What did you learn from it?', category: 'growth' },
    { question: 'How do you prioritize tasks when you have multiple deadlines?', category: 'time-management' },
    { question: 'Tell me about a time you demonstrated leadership.', category: 'leadership' },
    { question: 'How do you stay current with industry trends and developments?', category: 'learning' },
    { question: 'Describe your ideal work environment and management style.', category: 'culture-fit' },
    { question: 'Tell me about a project you are most proud of.', category: 'achievements' },
  ],
  hard: [
    { question: 'Describe a time you had to influence senior stakeholders without direct authority.', category: 'influence' },
    { question: 'Tell me about a situation where you had to make a difficult ethical decision.', category: 'ethics' },
    { question: 'Describe a time when you had to pivot your strategy due to unexpected circumstances.', category: 'adaptability' },
    { question: 'How have you built cross-functional alignment on a controversial initiative?', category: 'leadership' },
    { question: 'Tell me about a time you had to deliver bad news to a client or executive.', category: 'communication' },
    { question: 'Describe how you have driven cultural change in an organization.', category: 'leadership' },
    { question: 'Tell me about a time you identified a significant business opportunity and acted on it.', category: 'initiative' },
    { question: 'Describe a situation where you had to balance competing priorities across teams.', category: 'strategy' },
  ],
};

const behavioralQuestions: Record<Difficulty, QuestionSet[]> = {
  easy: [
    { question: 'Tell me about a time you worked effectively as part of a team.', category: 'teamwork' },
    { question: 'Describe a situation where you went above and beyond for a customer.', category: 'customer-focus' },
    { question: 'Give an example of a goal you set and how you achieved it.', category: 'goal-setting' },
    { question: 'Tell me about a time you had to learn something new quickly.', category: 'adaptability' },
    { question: 'Describe a situation where you showed initiative.', category: 'initiative' },
    { question: 'Tell me about a time you received constructive feedback.', category: 'feedback' },
    { question: 'Give an example of when you helped a colleague succeed.', category: 'teamwork' },
    { question: 'Describe a time you had to meet a tight deadline.', category: 'time-management' },
  ],
  medium: [
    { question: 'Tell me about a time you had to handle a difficult stakeholder relationship.', category: 'stakeholder-management' },
    { question: 'Describe a situation where you had to make a decision with incomplete information.', category: 'decision-making' },
    { question: 'Tell me about a time you successfully managed competing priorities.', category: 'prioritization' },
    { question: 'Give an example of when you identified a problem and proactively solved it.', category: 'problem-solving' },
    { question: 'Describe a time when you had to adapt your communication style for different audiences.', category: 'communication' },
    { question: 'Tell me about a time you disagreed with your manager. How did you handle it?', category: 'conflict-resolution' },
    { question: 'Describe a situation where you had to motivate others during a difficult time.', category: 'leadership' },
    { question: 'Tell me about a time you took on responsibilities outside your job description.', category: 'initiative' },
  ],
  hard: [
    { question: 'Describe a time you had to lead organizational change against significant resistance.', category: 'change-management' },
    { question: 'Tell me about a situation where you had to rebuild trust after a significant setback.', category: 'resilience' },
    { question: 'Give an example of when you had to make a high-stakes decision with major consequences.', category: 'decision-making' },
    { question: 'Describe a time you had to navigate complex political dynamics to achieve a goal.', category: 'organizational-navigation' },
    { question: 'Tell me about a time you transformed a failing project into a success.', category: 'problem-solving' },
    { question: 'Describe how you built and scaled a high-performing team from scratch.', category: 'leadership' },
    { question: 'Tell me about a time you had to give very difficult feedback to a high performer.', category: 'feedback' },
    { question: 'Give an example of when you had to defend an unpopular position to senior leadership.', category: 'influence' },
  ],
};

const communicationQuestions: Record<Difficulty, QuestionSet[]> = {
  easy: [
    { question: 'How do you ensure your communication is clear when explaining a complex topic?', category: 'clarity' },
    { question: 'Describe your approach to writing professional emails.', category: 'written' },
    { question: 'How do you prepare for an important presentation?', category: 'presentation' },
    { question: 'Tell me about a time when clear communication helped you achieve a positive outcome.', category: 'effectiveness' },
    { question: 'How do you actively listen during conversations?', category: 'listening' },
    { question: 'Describe how you adjust your tone depending on who you are speaking with.', category: 'adaptation' },
    { question: 'How do you handle misunderstandings in professional settings?', category: 'conflict' },
    { question: 'Tell me about your experience with public speaking or presentations.', category: 'public-speaking' },
  ],
  medium: [
    { question: 'Describe a time when you had to present technical information to a non-technical audience.', category: 'translation' },
    { question: 'How do you structure your communication when you need to influence decision-makers?', category: 'persuasion' },
    { question: 'Tell me about a time your communication skills directly impacted a project outcome.', category: 'impact' },
    { question: 'How do you ensure alignment across teams with different communication styles?', category: 'cross-functional' },
    { question: 'Describe your approach to delivering negative feedback constructively.', category: 'feedback' },
    { question: 'How do you manage communication across different time zones and cultures?', category: 'global' },
    { question: 'Tell me about a time you had to negotiate under pressure.', category: 'negotiation' },
    { question: 'How do you document decisions and communicate them to stakeholders?', category: 'documentation' },
  ],
  hard: [
    { question: 'Describe a situation where you had to change deeply entrenched beliefs through communication.', category: 'influence' },
    { question: 'How have you used storytelling to drive executive-level decisions?', category: 'storytelling' },
    { question: 'Tell me about a time you managed a major communications crisis.', category: 'crisis-comms' },
    { question: 'How do you build a communication strategy that aligns with business objectives?', category: 'strategy' },
    { question: 'Describe your approach to communicating vision and inspiring large teams.', category: 'leadership-comms' },
    { question: 'How have you used data and evidence to overcome skepticism in high-stakes decisions?', category: 'data-driven' },
    { question: 'Tell me about a time you successfully mediated a serious organizational conflict.', category: 'mediation' },
    { question: 'Describe how you approach thought leadership and building credibility externally.', category: 'thought-leadership' },
  ],
};

const questionBanks: Record<InterviewType, Record<Difficulty, QuestionSet[]>> = {
  technical: technicalQuestions,
  hr: hrQuestions,
  behavioral: behavioralQuestions,
  communication: communicationQuestions,
};

export function getQuestions(type: InterviewType, difficulty: Difficulty, count: number): QuestionSet[] {
  const bank = questionBanks[type][difficulty];
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getOpeningQuestion(role: string, type: InterviewType): QuestionSet {
  const openings: Record<InterviewType, string> = {
    technical: `Thank you for joining us today. Before we dive into the technical questions, could you walk me through your technical background and the most relevant experience you have for the ${role} role?`,
    hr: `Welcome! I'm excited to learn more about you. Could you start by telling me about yourself and what drew you to apply for the ${role} position?`,
    behavioral: `Great to meet you! To start, could you give me an overview of your professional background and share a recent achievement you are particularly proud of in your ${role}-related experience?`,
    communication: `Welcome! Communication is at the heart of everything we do. Let's start by having you describe your communication philosophy and how it has shaped your work as a ${role}.`,
  };

  return {
    question: openings[type],
    category: 'opening',
  };
}
