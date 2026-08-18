export const DEFAULT_DIAGNOSTICS = [
  {
    key: "disc",
    title: "DISC Assessment",
    subtitle: "Dominance, Influence, Steadiness, Conscientiousness",
    description: "Measures four core dimensions of behavior to understand communication, teamwork, and task styles.",
    customFieldLabel: "Primary Career Goal",
    isPaid: false,
    requiredTier: "basic",
    price: 0,
    category: "Behavioral Dimensions",
    questions: [
      {
        id: "disc_q1",
        text: "When facing a major challenge or obstacle, what is your immediate response?",
        options: [
          { id: "o1", text: "Take charge directly and focus on a fast, decisive solution.", value: "D" },
          { id: "o2", text: "Gather people together to discuss, motivate, and brainstorm.", value: "I" },
          { id: "o3", text: "Step back, remain calm, and work methodically to maintain stability.", value: "S" },
          { id: "o4", text: "Analyze all data and details thoroughly before making a precise plan.", value: "C" }
        ]
      },
      {
        id: "disc_q2",
        text: "How would others most likely describe your communication style?",
        options: [
          { id: "o1", text: "Direct, assertive, and results-oriented.", value: "D" },
          { id: "o2", text: "Enthusiastic, persuasive, and outgoing.", value: "I" },
          { id: "o3", text: "Patient, supportive, and an active listener.", value: "S" },
          { id: "o4", text: "Diplomatic, analytical, and detail-focused.", value: "C" }
        ]
      },
      {
        id: "disc_q3",
        text: "In a team or group project, which role do you naturally fall into?",
        options: [
          { id: "o1", text: "The driver who sets targets and pushes for completion.", value: "D" },
          { id: "o2", text: "The promoter who builds relationships and keeps energy high.", value: "I" },
          { id: "o3", text: "The reliable team player who coordinates and supports others.", value: "S" },
          { id: "o4", text: "The quality checker who ensures standards and accuracy are met.", value: "C" }
        ]
      },
      {
        id: "disc_q4",
        text: "What is your biggest fear or source of discomfort at work or school?",
        options: [
          { id: "o1", text: "Losing control, lack of progress, or wasting time.", value: "D" },
          { id: "o2", text: "Social rejection, isolation, or being ignored.", value: "I" },
          { id: "o3", text: "Sudden changes, instability, or conflict.", value: "S" },
          { id: "o4", text: "Making mistakes, low standards, or lack of clear guidelines.", value: "C" }
        ]
      },
      {
        id: "disc_q5",
        text: "What motivates you the most to excel?",
        options: [
          { id: "o1", text: "Independence, power, and achieving major results.", value: "D" },
          { id: "o2", text: "Recognition, praise, and connecting with others.", value: "I" },
          { id: "o3", text: "Cooperation, security, and a peaceful environment.", value: "S" },
          { id: "o4", text: "Precision, quality work, and gaining deep expertise.", value: "C" }
        ]
      }
    ]
  },
  {
    key: "mbti",
    title: "Myers-Briggs Type Indicator (MBTI)",
    subtitle: "16 Psychological Personalities",
    description: "Evaluates your preferences across four core cognitive dichotomies to identify one of the 16 personality types.",
    customFieldLabel: "Current Stream / Field of Study",
    isPaid: false,
    requiredTier: "basic",
    price: 0,
    category: "Personality & Cognition",
    questions: [
      {
        id: "mbti_q1",
        text: "After a busy and socially active week, how do you recharge your energy?",
        options: [
          { id: "o1", text: "By spending time with friends, going out, or socializing.", value: "E" },
          { id: "o2", text: "By spending quiet time alone, reading, or relaxing in private.", value: "I" }
        ]
      },
      {
        id: "mbti_q2",
        text: "When in a social gathering, do you usually...",
        options: [
          { id: "o1", text: "Start conversations with many people, including strangers.", value: "E" },
          { id: "o2", text: "Keep conversations to a few people you already know well.", value: "I" }
        ]
      },
      {
        id: "mbti_q3",
        text: "When learning a new subject, what type of information appeals to you more?",
        options: [
          { id: "o1", text: "Practical facts, concrete details, and real-world examples.", value: "S" },
          { id: "o2", text: "General concepts, theoretical models, and future possibilities.", value: "N" }
        ]
      },
      {
        id: "mbti_q4",
        text: "You tend to trust...",
        options: [
          { id: "o1", text: "Direct experience, solid evidence, and historical data.", value: "S" },
          { id: "o2", text: "Your gut feelings, subtle patterns, and creative insights.", value: "N" }
        ]
      },
      {
        id: "mbti_q5",
        text: "When making a difficult decision, what do you prioritize?",
        options: [
          { id: "o1", text: "Logical analysis, objective truth, and fairness.", value: "T" },
          { id: "o2", text: "Impact on people, personal values, and harmony.", value: "F" }
        ]
      },
      {
        id: "mbti_q6",
        text: "How do others view your decision-making style?",
        options: [
          { id: "o1", text: "Reasonable, analytical, and sometimes tough-minded.", value: "T" },
          { id: "o2", text: "Warm, empathetic, and sensitive to feelings.", value: "F" }
        ]
      },
      {
        id: "mbti_q7",
        text: "How do you prefer to manage your daily schedule and tasks?",
        options: [
          { id: "o1", text: "Having a clear plan, checking off checklists, and avoiding last-minute rushes.", value: "J" },
          { id: "o2", text: "Remaining flexible, adapting to opportunities, and working under pressure.", value: "P" }
        ]
      },
      {
        id: "mbti_q8",
        text: "Your work and study spaces are typically...",
        options: [
          { id: "o1", text: "Organized, neat, and highly structured.", value: "J" },
          { id: "o2", text: "Relaxed, organic, and occasionally messy.", value: "P" }
        ]
      }
    ]
  },
  {
    key: "16pf",
    title: "Personality Factor Questionnaire",
    subtitle: "16PF Career Matching",
    description: "Evaluates your primary work, thinking, and communication styles to map you to optimal career paths.",
    customFieldLabel: "Preferred Work / Study Style",
    isPaid: true,
    requiredTier: "advance",
    price: 299,
    category: "Career & Work Factors",
    questions: [
      {
        id: "pf_q1",
        text: "How do you approach complex problems requiring long-term analysis?",
        options: [
          { id: "o1", text: "Break it down systematically and work in absolute quiet.", value: "Analytical" },
          { id: "o2", text: "Collaborate immediately with others and experiment actively.", value: "Collaborative" },
          { id: "o3", text: "Follow established guidelines and trusted standards.", value: "Structured" }
        ]
      },
      {
        id: "pf_q2",
        text: "When team roles are being assigned, you typically prefer:",
        options: [
          { id: "o1", text: "Direct leadership, setting strategic goals.", value: "Dominance" },
          { id: "o2", text: "Execution, ensuring all tasks conform strictly to rules.", value: "Rule-Conscious" },
          { id: "o3", text: "Facilitating communication and helping resolve disputes.", value: "Warmth" }
        ]
      },
      {
        id: "pf_q3",
        text: "If a project plan changes suddenly at the last minute, you:",
        options: [
          { id: "o1", text: "Adapt quickly and enjoy the challenge of finding new ways.", value: "Open-To-Change" },
          { id: "o2", text: "Feel anxious or stressed about the lack of structured planning.", value: "Structured" },
          { id: "o3", text: "Quietly double-check the logic of the change before acting.", value: "Vigilant" }
        ]
      },
      {
        id: "pf_q4",
        text: "In terms of personal reflection and internal thinking:",
        options: [
          { id: "o1", text: "You frequently daydream and analyze philosophical ideas.", value: "Abstracted" },
          { id: "o2", text: "You focus strictly on realistic, practical, hands-on tasks.", value: "Practical" }
        ]
      },
      {
        id: "pf_q5",
        text: "When working in stressful conditions, you remain:",
        options: [
          { id: "o1", text: "Calm, emotionally stable, and focused on the big picture.", value: "Stable" },
          { id: "o2", text: "Sensitive, highly alert, and reactive to details.", value: "Sensitive" }
        ]
      }
    ]
  },
  {
    key: "epi",
    title: "Eysenck Personality Inventory",
    subtitle: "EPI Temperament Scales",
    description: "Evaluates your biological temperament across Extraversion (E) and Neuroticism (N) scales to map to standard temperaments.",
    customFieldLabel: "Primary Stress Trigger / Coping Style",
    isPaid: false,
    requiredTier: "basic",
    price: 0,
    category: "Temperament & Emotional Scale",
    questions: [
      {
        id: "epi_q1",
        text: "Do you tend to keep in the background on social occasions?",
        options: [
          { id: "o1", text: "No, you love being active and part of the conversation.", value: "E" },
          { id: "o2", text: "Yes, you prefer to stay quiet and observe.", value: "I" }
        ]
      },
      {
        id: "epi_q2",
        text: "Does your mood often go up and down without any obvious reason?",
        options: [
          { id: "o1", text: "Yes, your emotions fluctuate quite frequently.", value: "N" },
          { id: "o2", text: "No, you are generally emotionally steady and calm.", value: "S" }
        ]
      },
      {
        id: "epi_q3",
        text: "Would you say that you are a highly lively and talkative person?",
        options: [
          { id: "o1", text: "Absolutely, you talk a lot and express energy.", value: "E" },
          { id: "o2", text: "Not really, you are reserved and think before talking.", value: "I" }
        ]
      },
      {
        id: "epi_q4",
        text: "Do you often worry about things that you should not have done or said?",
        options: [
          { id: "o1", text: "Yes, you dwell on conversations and worry a lot.", value: "N" },
          { id: "o2", text: "No, you let go of things easily and do not worry.", value: "S" }
        ]
      },
      {
        id: "epi_q5",
        text: "When things go wrong, do you easily lose your temper or get upset?",
        options: [
          { id: "o1", text: "Yes, you react intensely and feel stressed.", value: "N" },
          { id: "o2", text: "No, you stay cool and handle it calmly.", value: "S" }
        ]
      }
    ]
  },
  {
    key: "enneagram",
    title: "Enneagram Core Test",
    subtitle: "9 Interconnected Personality Types",
    description: "Uncovers your core motivations, deepest fears, and developmental pathways among the 9 archetypes.",
    customFieldLabel: "Your Core Life Motivation",
    isPaid: true,
    requiredTier: "advance",
    price: 349,
    category: "Core Motivations & Drivers",
    questions: [
      {
        id: "en_q1",
        text: "What is your deepest core desire or ultimate goal in life?",
        options: [
          { id: "o1", text: "To be perfect, upright, and have high moral standards.", value: "Type 1 - Reformer" },
          { id: "o2", text: "To feel loved, helpful, and deeply appreciated.", value: "Type 2 - Helper" },
          { id: "o3", text: "To be successful, admired, and highly productive.", value: "Type 3 - Achiever" },
          { id: "o4", text: "To be unique, authentic, and understand your deep feelings.", value: "Type 4 - Individualist" }
        ]
      },
      {
        id: "en_q2",
        text: "How do you typically react when a problem arises?",
        options: [
          { id: "o1", text: "Analyze it intellectually, seeking knowledge.", value: "Type 5 - Investigator" },
          { id: "o2", text: "Anticipate risks, seek security, and consult systems.", value: "Type 6 - Loyalist" },
          { id: "o3", text: "Avoid pain, find fun alternatives and solutions.", value: "Type 7 - Enthusiast" },
          { id: "o4", text: "Take direct control and defend your boundaries.", value: "Type 8 - Challenger" },
          { id: "o5", text: "Keep the peace and go with the flow.", value: "Type 9 - Peacemaker" }
        ]
      },
      {
        id: "en_q3",
        text: "When working in a team, you feel most comfortable when:",
        options: [
          { id: "o1", text: "Everything is organized correctly and matches high standards.", value: "Type 1 - Reformer" },
          { id: "o2", text: "You can support members and ensure warmth.", value: "Type 2 - Helper" },
          { id: "o3", text: "The team is hitting goals and achieving milestones.", value: "Type 3 - Achiever" },
          { id: "o4", text: "The project allows for personal expression and uniqueness.", value: "Type 4 - Individualist" }
        ]
      },
      {
        id: "en_q4",
        text: "Your attitude towards rules and security is usually:",
        options: [
          { id: "o1", text: "You question them intellectually to find the absolute truth.", value: "Type 5 - Investigator" },
          { id: "o2", text: "You respect rules for safety but prepare for the worst.", value: "Type 6 - Loyalist" },
          { id: "o3", text: "You view rules as limiting and seek variety.", value: "Type 7 - Enthusiast" },
          { id: "o4", text: "You make your own rules and resist control.", value: "Type 8 - Challenger" }
        ]
      },
      {
        id: "en_q5",
        text: "If someone disagrees with you, your immediate reaction is to:",
        options: [
          { id: "o1", text: "Correct them with facts and objective logic.", value: "Type 1 - Reformer" },
          { id: "o2", text: "Adapt or compromise to preserve a peaceful relationship.", value: "Type 9 - Peacemaker" },
          { id: "o3", text: "Assert your position strongly and engage in debate.", value: "Type 8 - Challenger" },
          { id: "o4", text: "Feel personally misunderstood or unique.", value: "Type 4 - Individualist" }
        ]
      }
    ]
  },
  {
    key: "caliper",
    title: "Caliper Profile",
    subtitle: "Job Performance Matching",
    description: "Aligns your cognitive styles and personal drivers directly with high-performance job domains and organizational roles.",
    customFieldLabel: "Desired Professional Field / Industry",
    isPaid: true,
    requiredTier: "pro",
    price: 499,
    category: "Professional & Leadership Competency",
    questions: [
      {
        id: "cal_q1",
        text: "How do you handle persuading someone who initially disagrees with you?",
        options: [
          { id: "o1", text: "Listen deeply to understand their needs, then adjust your pitch.", value: "High Empathy" },
          { id: "o2", text: "Present powerful facts, speak assertively, and push for agreement.", value: "High Assertiveness" },
          { id: "o3", text: "Feel highly energized by the challenge of winning them over.", value: "High Ego-Drive" },
          { id: "o4", text: "Find a structured, standard policy to settle the argument.", value: "High Structure" }
        ]
      },
      {
        id: "cal_q2",
        text: "When managing multiple tasks with tight deadlines, you:",
        options: [
          { id: "o1", text: "Excel at shifting focus dynamically and taking quick risks.", value: "High Flexibility" },
          { id: "o2", text: "Methodically schedule each hour and avoid any deviations.", value: "High Organization" },
          { id: "o3", text: "Take absolute responsibility and direct others on what to do.", value: "High Leadership" }
        ]
      },
      {
        id: "cal_q3",
        text: "In terms of analyzing data and logical systems, you:",
        options: [
          { id: "o1", text: "Love solving abstract puzzles and identifying hidden patterns.", value: "High Cognitive" },
          { id: "o2", text: "Prefer practical, hands-on application over abstract theories.", value: "High Practical" }
        ]
      },
      {
        id: "cal_q4",
        text: "What keeps you going after experiencing a significant setback?",
        options: [
          { id: "o1", text: "The strong inner desire to prove your capability and win.", value: "High Ego-Drive" },
          { id: "o2", text: "Having a supportive team and maintaining stable workflows.", value: "High Sociability" }
        ]
      },
      {
        id: "cal_q5",
        text: "When presenting your ideas in a public meeting, you:",
        options: [
          { id: "o1", text: "Express yourself with high confidence and relish the attention.", value: "High Social Boldness" },
          { id: "o2", text: "Write down a detailed script in advance to ensure total accuracy.", value: "High Thoroughness" }
        ]
      }
    ]
  },
  {
    key: "mmpi",
    title: "Minnesota Multiphasic Test",
    subtitle: "MMPI Clinical Insights",
    description: "Evaluates your psychological coping capacity, emotional stability, and behavioral tendencies under stress.",
    customFieldLabel: "General Emotional State Recently",
    isPaid: true,
    requiredTier: "pro",
    price: 499,
    category: "Stress Tolerance & Clinical Insights",
    questions: [
      {
        id: "mmp_q1",
        text: "Under high academic or professional pressure, how do you feel physically?",
        options: [
          { id: "o1", text: "You frequently develop headaches, fatigue, or stomach discomfort.", value: "Somatic Tendency" },
          { id: "o2", text: "Your physical state remains stable; you manage stress mentally.", value: "Somatic Stability" }
        ]
      },
      {
        id: "mmp_q2",
        text: "Do you occasionally feel like people around you are critical or talking about you?",
        options: [
          { id: "o1", text: "Yes, you often feel defensive and suspicious of others' motives.", value: "Paranoia Tendency" },
          { id: "o2", text: "No, you rarely worry about what others say or think behind your back.", value: "Social Confidence" }
        ]
      },
      {
        id: "mmp_q3",
        text: "How would you describe your level of daily energy and excitement?",
        options: [
          { id: "o1", text: "Extremely high; you often take on too many projects and speak rapidly.", value: "Hypomania Tendency" },
          { id: "o2", text: "Steady and balanced; you work at a sustainable, moderate pace.", value: "Balanced Energy" },
          { id: "o3", text: "Often quite low; you struggle with motivation and feel downcast.", value: "Depression Tendency" }
        ]
      },
      {
        id: "mmp_q4",
        text: "When in a social setting, how comfortable do you feel interacting?",
        options: [
          { id: "o1", text: "You feel extremely anxious, prefer to stay alone, and avoid crowds.", value: "Social Introversion" },
          { id: "o2", text: "You are highly comfortable, outgoing, and thrive in group environments.", value: "Social Extraversion" }
        ]
      },
      {
        id: "mmp_q5",
        text: "How often do you find yourself double-checking your actions, thoughts, or doors?",
        options: [
          { id: "o1", text: "Constantly; you worry excessively about mistakes and small details.", value: "Anxiety Tendency" },
          { id: "o2", text: "Occasionally or normally; you trust your actions and move on quickly.", value: "High Self-Trust" }
        ]
      }
    ]
  }
];
