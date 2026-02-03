/*LEARNERS GURU - js file */
class PasswordValidator {
  constructor() {
    this.passwordStrengthConfig = {
      minLength: 8,
      maxLength: 128,
      requirements: {
        length: { weight: 20, message: "At least 8 characters" },
        lowercase: { weight: 15, message: "One lowercase letter (a-z)" },
        uppercase: { weight: 15, message: "One uppercase letter (A-Z)" },
        number: { weight: 15, message: "One number (0-9)" },
        special: { weight: 15, message: "One special character (!@#$%^&*)" },
        complexity: { weight: 20, message: "Avoid common patterns" },
      },
    };
    this.init();
  }

  init() {
    this.setupPasswordChecker();
  }

  setupPasswordChecker() {
    const passwordInput =
      document.getElementById("pwd") || document.getElementById("password");
    if (!passwordInput) return;

    this.input = passwordInput;

    const passwordStrengthContainer = this.createPasswordStrengthChecker();
    passwordInput.parentNode.insertBefore(
      passwordStrengthContainer,
      passwordInput.nextSibling,
    );

    if (passwordInput.value) {
      this.validatePasswordStrength(
        passwordInput.value,
        passwordStrengthContainer,
      );
    }

    let validationTimeout;
    passwordInput.addEventListener("input", (e) => {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => {
        this.validatePasswordStrength(
          e.target.value,
          passwordStrengthContainer,
        );
      }, 200);
    });

    passwordInput.addEventListener("focus", () => {
      passwordStrengthContainer.style.opacity = "1";
      passwordStrengthContainer.style.transform = "translateY(0)";
    });

    passwordInput.addEventListener("blur", () => {
      if (!passwordInput.value) {
        passwordStrengthContainer.style.opacity = "0";
        passwordStrengthContainer.style.transform = "translateY(-10px)";
      }
    });

    this.container = passwordStrengthContainer;
  }

  createPasswordStrengthChecker() {
    const container = document.createElement("div");
    container.id = "password-strength-advanced";
    container.style.cssText = `
      margin-top: 12px;
      padding: 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.07) 100%);
      border: 1px solid #e0e0e0;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 12px;
      line-height: 1.5;
    `;

    const strengthIndicator = document.createElement("div");
    strengthIndicator.style.cssText = `
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      margin-bottom: 12px;
      overflow: hidden;
      position: relative;
    `;

    const strengthBar = document.createElement("div");
    strengthBar.style.cssText = `
      height: 100%;
      width: 0%;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 3px;
      position: relative;
      overflow: hidden;
    `;

    const shimmer = document.createElement("div");
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2s infinite;
    `;

    if (!document.getElementById("password-validator-shimmer-styles")) {
      const s = document.createElement("style");
      s.id = "password-validator-shimmer-styles";
      s.innerHTML = `
        @keyframes shimmer {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `;
      document.head.appendChild(s);
    }

    const strengthText = document.createElement("div");
    strengthText.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 13px;
      transition: color 0.3s ease;
    `;

    const requirementsList = document.createElement("div");
    requirementsList.innerHTML = `
      <div class="password-rule" data-rule="length">○ ${this.passwordStrengthConfig.requirements.length.message}</div>
      <div class="password-rule" data-rule="lowercase">○ ${this.passwordStrengthConfig.requirements.lowercase.message}</div>
      <div class="password-rule" data-rule="uppercase">○ ${this.passwordStrengthConfig.requirements.uppercase.message}</div>
      <div class="password-rule" data-rule="number">○ ${this.passwordStrengthConfig.requirements.number.message}</div>
      <div class="password-rule" data-rule="special">○ ${this.passwordStrengthConfig.requirements.special.message}</div>
      <div class="password-rule" data-rule="complexity">○ ${this.passwordStrengthConfig.requirements.complexity.message}</div>
    `;

    const suggestions = document.createElement("div");
    suggestions.className = "password-suggestions";
    suggestions.style.cssText = `
      margin-top: 12px;
      padding: 8px;
      background: rgba(102, 126, 234, 0.06);
      border-radius: 4px;
      font-size: 11px;
      color: #3c4bd9;
      display: none;
    `;

    strengthBar.appendChild(shimmer);
    strengthIndicator.appendChild(strengthBar);
    container.appendChild(strengthIndicator);
    container.appendChild(strengthText);
    container.appendChild(requirementsList);
    container.appendChild(suggestions);

    return container;
  }

  validatePasswordStrength(password, container) {
    const { requirements } = this.passwordStrengthConfig;
    let totalScore = 0;
    const results = {};

    const lengthScore = Math.min(
      (password.length / 12) * requirements.length.weight,
      requirements.length.weight,
    );
    results.length = password.length >= this.passwordStrengthConfig.minLength;
    totalScore += lengthScore;

    results.lowercase = /[a-z]/.test(password);
    if (results.lowercase) totalScore += requirements.lowercase.weight;

    results.uppercase = /[A-Z]/.test(password);
    if (results.uppercase) totalScore += requirements.uppercase.weight;

    results.number = /[0-9]/.test(password);
    if (results.number) totalScore += requirements.number.weight;

    results.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (results.special) totalScore += requirements.special.weight;

    // Complexity
    const complexityScore = this.calculateComplexity(password);
    results.complexity = complexityScore > 0.7;
    totalScore += complexityScore * requirements.complexity.weight;

    this.updatePasswordDisplay(container, results, totalScore, password);

    return { results, score: Math.min(totalScore, 100) };
  }

  analyzePassword(password = "") {

    return this.validatePasswordStrength(
      password,
      this.container || { querySelector: () => null, children: [] },
    );
  }

  calculateComplexity(password) {
    let complexity = 0;
    const commonPatterns = [/123/, /abc/, /qwerty/, /password/, /admin/];
    const hasRepeats = /(.)\1{2,}/.test(password);

    if (commonPatterns.some((pattern) => pattern.test(password.toLowerCase())))
      complexity -= 0.3;
    if (hasRepeats) complexity -= 0.2;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) complexity += 0.2;
    if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) complexity += 0.2;
    if (password.length >= 12) complexity += 0.3;

    return Math.max(0, Math.min(1, complexity + 0.7));
  }

  updatePasswordDisplay(container, results, score, password) {

    if (!container) return;

    const strengthBar = container.querySelector("div > div");
    const strengthText = container.children[1];
    const suggestions = container.querySelector(".password-suggestions");
    const rules = container.querySelectorAll(".password-rule");

    const percentage = Math.min(score, 100);
    if (strengthBar) strengthBar.style.width = `${percentage}%`;

    let color, strength;
    if (score < 30) {
      color = "#ff4757";
      strength = "Very Weak";
    } else if (score < 50) {
      color = "#ffa502";
      strength = "Weak";
    } else if (score < 70) {
      color = "#ff6348";
      strength = "Fair";
    } else if (score < 85) {
      color = "#1dd1a1";
      strength = "Good";
    } else {
      color = "#2ed573";
      strength = "Excellent";
    }

    if (strengthBar) strengthBar.style.background = color;
    if (strengthText) {
      strengthText.style.color = color;
      strengthText.textContent = `Strength: ${strength} (${Math.round(percentage)}%)`;
    }

    rules.forEach((rule) => {
      const isValid = results[rule.dataset.rule];
      rule.style.color = isValid ? "#2ed573" : "#666";

      if (isValid) {
        rule.innerHTML = rule.innerHTML.replace("○", "✓");
      } else {
        rule.innerHTML = rule.innerHTML.replace("✓", "○");
      }
    });

    if (score < 70) {
      suggestions.style.display = "block";
      suggestions.innerHTML = this.getPasswordSuggestions(password, results);
    } else {
      suggestions.style.display = "none";
    }
  }

  getPasswordSuggestions(password, results) {
    const suggestions = [];
    if (password.length < this.passwordStrengthConfig.minLength)
      suggestions.push("• Make it longer (8+ chars)");
    if (!results.uppercase) suggestions.push("• Add uppercase (A-Z)");
    if (!results.lowercase) suggestions.push("• Add lowercase (a-z)");
    if (!results.number) suggestions.push("• Add numbers (0-9)");
    if (!results.special) suggestions.push("• Add special characters (!@#$%)");
    if (results.complexity === false)
      suggestions.push(
        "• Avoid common patterns like '123', 'qwerty', 'password'",
      );

    return suggestions.length > 0
      ? `<strong>💡 Suggestions:</strong><br>${suggestions.join("<br>")}`
      : "";
  }
}


(function () {
  "use strict";

  let passwordValidator = null;
  const companies = [
    {
      name: "Google",
      logo: "logos/google.svg",
    },
    {
      name: "Microsoft",
      logo: "logos/microsoft.svg",
    },
    {
      name: "Amazon",
      logo: "logos/amazon.svg",
    },
    {
      name: "TCS",
      logo: "logos/tcs.png",
    },
    {
      name: "Infosys",
      logo: "logos/infosys.svg",
    },
    {
      name: "Wipro",
      logo: "logos/wipro.svg",
    },
    {
      name: "IBM",
      logo: "logos/ibm.svg",
    },
    {
      name: "Accenture",
      logo: "logos/accenture.svg",
    },
    {
      name: "Oracle",
      logo: "logos/oracle.svg",
    },
    {
      name: "Capgemini",
      logo: "logos/capgemini.svg",
    },
    {
      name: "Deloitte",
      logo: "logos/deloitte.png",
    },
    {
      name: "Intel",
      logo: "logos/intel.svg",
    },
    {
      name: "Adobe",
      logo: "logos/adobe.png",
    },
    {
      name: "SAP",
      logo: "logos/sap.svg",
    },
    {
      name: "Cisco",
      logo: "logos/cisco.svg",
    },
    {
      name: "HP",
      logo: "logos/hp.svg",
    },
    {
      name: "Dell",
      logo: "logos/dell.svg",
    },
    {
      name: "Cognizant",
      logo: "logos/cognizant.png",
    },
    {
      name: "HCL",
      logo: "logos/hcl.png",
    },
    {
      name: "Tech Mahindra",
      logo: "logos/techmahindra.png",
    },
    {
      name: "L&T Infotech",
      logo: "logos/ltimindtree.png",
    },
    {
      name: "Qualcomm",
      logo: "logos/qualcomm.svg",
    },
    {
      name: "KPMG",
      logo: "logos/kpmg.png",
    },
    {
      name: "PwC",
      logo: "logos/pwc.svg",
    },
    {
      name: "EY",
      logo: "logos/ey.png",
    },
    {
      name: "McKinsey",
      logo: "logos/mckinsey.png",
    },
    {
      name: "Goldman Sachs",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    },
    {
      name: "JP Morgan",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg",
    },
    {
      name: "PayPal",
      logo: "logos/paypal.svg",
    },
    {
      name: "Salesforce",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    },
    {
      name: "Uber",
      logo: "logos/uber.svg",
    },
    {
      name: "LinkedIn",
      logo: "logos/linkedin.svg",
    },
    {
      name: "Meta",
      logo: "logos/meta.svg",
    },
    {
      name: "Netflix",
      logo: "logos/netflix.svg",
    },
    {
      name: "Spotify",
      logo: "logos/spotify.svg",
    },
    {
      name: "Airbnb",
      logo: "logos/airbnb.svg",
    },
    // New / Updated Companies — using Wikipedia URLs
    {
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      name: "NVIDIA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/NVIDIA_logo.svg",
    },
    {
      name: "Twitter",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg",
    },
    {
      name: "Red Hat",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Red_Hat_logo.svg",
    },
  ];

  //  COURSES DATA 
  const courses = [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      description:
        "Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer from scratch.",
      instructor: "Dr. Priya Sharma",
      duration: "48 hours",
      students: 15420,
      rating: 4.9,
      category: "Web Development",
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
      topics: [
        "HTML5 & CSS3 Fundamentals",
        "JavaScript ES6+ & DOM",
        "React.js & Hooks",
        "Node.js & Express",
        "MongoDB & REST APIs",
        "Git & Deployment",
      ],
      level: "Beginner to Advanced",
      projects: 12,
    },
    {
      id: "2",
      title: "Data Science & Machine Learning",
      description:
        "Learn Python, data analysis, visualization, and build predictive ML models with real-world projects.",
      instructor: "Prof. Rajesh Kumar",
      duration: "60 hours",
      students: 12380,
      rating: 4.8,
      category: "Data Science",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      topics: [
        "Python for Data Science",
        "NumPy & Pandas",
        "Data Visualization",
        "Machine Learning Algorithms",
        "Deep Learning & Neural Networks",
        "Model Deployment",
      ],
      level: "Intermediate",
      projects: 8,
    },
    {
      id: "3",
      title: "Digital Marketing Mastery",
      description:
        "Complete guide to SEO, social media marketing, Google Ads, and building successful campaigns.",
      instructor: "Ananya Gupta",
      duration: "32 hours",
      students: 8956,
      rating: 4.7,
      category: "Marketing",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      topics: [
        "SEO & Keyword Research",
        "Google Ads & PPC",
        "Social Media Marketing",
        "Content Marketing Strategy",
        "Email Marketing Automation",
        "Analytics & Reporting",
      ],
      level: "Beginner",
      projects: 6,
    },
    {
      id: "4",
      title: "Advanced Mathematics for Competitive Exams",
      description:
        "Comprehensive preparation for JEE, GATE, and other competitive exams with problem-solving strategies.",
      instructor: "Dr. Vikram Singh",
      duration: "80 hours",
      students: 21450,
      rating: 4.9,
      category: "Academics",
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
      topics: [
        "Calculus & Differential Equations",
        "Linear Algebra & Matrices",
        "Probability & Statistics",
        "Complex Numbers",
        "Coordinate Geometry",
        "Problem-Solving Techniques",
      ],
      level: "Advanced",
      projects: 500,
    },
    {
      id: "5",
      title: "UI/UX Design Fundamentals",
      description:
        "Learn design thinking, wireframing, prototyping, and create stunning user experiences with Figma.",
      instructor: "Meera Patel",
      duration: "36 hours",
      students: 6782,
      rating: 4.8,
      category: "Design",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
      topics: [
        "Design Thinking Process",
        "User Research & Personas",
        "Wireframing & Prototyping",
        "Figma Advanced Techniques",
        "Design Systems",
        "Usability Testing",
      ],
      level: "Beginner to Intermediate",
      projects: 5,
    },
    {
      id: "6",
      title: "English Communication Skills",
      description:
        "Improve your spoken English, business communication, and presentation skills for career growth.",
      instructor: "Sarah Wilson",
      duration: "28 hours",
      students: 18230,
      rating: 4.6,
      category: "Language",
      image:
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop",
      topics: [
        "Grammar & Vocabulary Building",
        "Spoken English Fluency",
        "Business Communication",
        "Email & Report Writing",
        "Presentation Skills",
        "Interview Preparation",
      ],
      level: "All Levels",
      projects: 10,
    },


    {
      id: "7",
      title: "Mastering Java: From Core to Spring Boot",
      description:
        "A comprehensive guide to Java programming, Object-Oriented Programming, and building enterprise-grade applications with Spring Boot.",
      instructor: "Rahul Verma",
      duration: "55 hours",
      students: 10200,
      rating: 4.8,
      category: "Software Development",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
      topics: [
        "Java Core & OOP Concepts",
        "Collections Framework & Streams",
        "Multithreading & Concurrency",
        "Spring Boot & Microservices",
        "Hibernate & JPA",
        "RESTful Web Services",
      ],
      level: "Intermediate",
      projects: 10,
    },
    {
      id: "8",
      title: "C# & .NET Core: Cross-Platform Development",
      description:
        "Learn C# programming and build modern, scalable web applications and APIs using the powerful ASP.NET Core framework.",
      instructor: "Emily Carter",
      duration: "45 hours",
      students: 7500,
      rating: 4.7,
      category: "Software Development",
      image:
        "https://images.unsplash.com/photo-1599837565318-67429bde7162?w=600&h=400&fit=crop",
      topics: [
        "C# Syntax & Advanced Features",
        "LINQ & Asynchronous Programming",
        "ASP.NET Core MVC",
        "Entity Framework Core",
        "Dependency Injection",
        "Blazor WebAssembly",
      ],
      level: "Beginner to Intermediate",
      projects: 7,
    },
    {
      id: "9",
      title: "AI Masterclass: Deep Learning & NLP",
      description:
        "Dive deep into Artificial Intelligence. Master Neural Networks, Computer Vision, and Natural Language Processing with PyTorch and TensorFlow.",
      instructor: "Dr. Ayesha Khan",
      duration: "70 hours",
      students: 14500,
      rating: 4.9,
      category: "Artificial Intelligence",
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
      topics: [
        "Neural Networks & Backpropagation",
        "Convolutional Neural Networks (CNN)",
        "Recurrent Neural Networks (RNN)",
        "Natural Language Processing (NLP)",
        "Transformers (BERT, GPT)",
        "Generative AI & LLMs",
      ],
      level: "Advanced",
      projects: 9,
    },
    {
      id: "10",
      title: "Go (Golang) Programming: The Complete Bootcamp",
      description:
        "Learn Google's Go language to build high-performance, concurrent, and scalable backend systems and microservices.",
      instructor: "Mark Stevenson",
      duration: "35 hours",
      students: 5400,
      rating: 4.8,
      category: "Backend Development",
      image:
        "https://images.unsplash.com/photo-1623282033815-40b05d96c903?w=600&h=400&fit=crop",
      topics: [
        "Go Syntax & Data Structures",
        "Goroutines & Channels",
        "Concurrency Patterns",
        "Building REST APIs with Gin",
        "gRPC & Protocol Buffers",
        "Testing & Benchmarking",
      ],
      level: "Intermediate",
      projects: 6,
    },
    {
      id: "11",
      title: "API Design Masterclass: REST & GraphQL",
      description:
        "Master the art of designing, building, securing, and documenting robust APIs using Node.js, Postman, and Swagger.",
      instructor: "Karthik Reddy",
      duration: "25 hours",
      students: 9200,
      rating: 4.7,
      category: "Backend Development",
      image:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop",
      topics: [
        "REST Architecture Principles",
        "GraphQL Schemas & Resolvers",
        "Authentication (JWT, OAuth2)",
        "API Security Best Practices",
        "Versioning & Documentation",
        "Rate Limiting & Caching",
      ],
      level: "Intermediate",
      projects: 5,
    },
    {
      id: "12",
      title: "Python Full Stack: Django & React",
      description:
        "Become a versatile Full Stack Developer by combining the power of Python's Django framework with the interactivity of React.js.",
      instructor: "Sophia Chen",
      duration: "52 hours",
      students: 11000,
      rating: 4.8,
      category: "Web Development",
      image:
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=400&fit=crop",
      topics: [
        "Django Models & ORM",
        "Django REST Framework",
        "React Components & Hooks",
        "Redux for State Management",
        "Authentication & Permissions",
        "Dockerization & Deployment",
      ],
      level: "Beginner to Advanced",
      projects: 8,
    },
    {
      id: "13",
      title: "Cloud Computing with AWS & DevOps",
      description:
        "Learn to deploy, scale, and manage applications on the cloud. Master AWS services, CI/CD pipelines, and Infrastructure as Code.",
      instructor: "David Miller",
      duration: "50 hours",
      students: 16800,
      rating: 4.9,
      category: "Cloud Computing",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
      topics: [
        "AWS Core Services (EC2, S3, RDS)",
        "Serverless Architecture (Lambda)",
        "Docker & Kubernetes",
        "CI/CD (Jenkins, GitHub Actions)",
        "Terraform (IaC)",
        "Cloud Security & Monitoring",
      ],
      level: "Intermediate to Advanced",
      projects: 7,
    },


    {
      id: "14",
      title: "Flutter & Dart: The Complete Guide",
      description:
        "Build beautiful, native-compiling mobile applications for iOS and Android from a single codebase using Google's Flutter framework.",
      instructor: "Angela Yu",
      duration: "42 hours",
      students: 13500,
      rating: 4.8,
      category: "Mobile Development",
      image:
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
      topics: [
        "Dart Programming Language",
        "Flutter Widgets & Layouts",
        "State Management (Provider/Riverpod)",
        "Firebase Integration",
        "Native Device Features",
        "Publishing to App Stores",
      ],
      level: "Beginner to Intermediate",
      projects: 15,
    },
    {
      id: "15",
      title: "Ethical Hacking & Cyber Security Bootcamp",
      description:
        "Learn penetration testing, network security, and how to think like a hacker to secure systems and networks effectively.",
      instructor: "Nathan House",
      duration: "58 hours",
      students: 19200,
      rating: 4.7,
      category: "Cybersecurity",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
      topics: [
        "Network Scanning & Enumeration",
        "Vulnerability Analysis",
        "Metasploit Framework",
        "Web App Hacking (OWASP Top 10)",
        "Wireless Network Security",
        "Social Engineering",
      ],
      level: "Beginner to Advanced",
      projects: 10,
    },
    {
      id: "16",
      title: "iOS 17 & Swift 5: App Development Bootcamp",
      description:
        "The complete guide to building premium iOS apps using Swift 5, SwiftUI, and UIKit. Become an Apple Developer.",
      instructor: "Dr. Yuval Noah",
      duration: "65 hours",
      students: 8400,
      rating: 4.9,
      category: "Mobile Development",
      image:
        "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=600&h=400&fit=crop",
      topics: [
        "Swift Programming Syntax",
        "SwiftUI vs UIKit",
        "Core Data & Realm",
        "ARKit (Augmented Reality)",
        "App Store Guidelines",
        "Git for iOS",
      ],
      level: "Beginner to Advanced",
      projects: 20,
    },
    {
      id: "17",
      title: "Unity Game Development with C#",
      description:
        "Master the Unity engine and C# programming to build 2D and 3D games. Learn physics, animation, and game mechanics.",
      instructor: "Rick Davidson",
      duration: "40 hours",
      students: 11000,
      rating: 4.8,
      category: "Game Development",
      image:
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop",
      topics: [
        "C# Scripting for Unity",
        "2D & 3D Game Physics",
        "Animation & Cutscenes",
        "Lighting & Shaders",
        "Audio Engineering for Games",
        "Multiplayer Networking",
      ],
      level: "Intermediate",
      projects: 5,
    },
    {
      id: "18",
      title: "Blockchain & Web3: From Zero to Hero",
      description:
        "Understand Blockchain technology, write Smart Contracts with Solidity, and build decentralized applications (DApps) on Ethereum.",
      instructor: "Gregory McCubbin",
      duration: "30 hours",
      students: 6200,
      rating: 4.6,
      category: "Blockchain",
      image:
        "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
      topics: [
        "Blockchain Fundamentals",
        "Solidity Programming",
        "Ethereum & EVM",
        "Web3.js & Ethers.js",
        "NFTs & DeFi Concepts",
        "Hardhat & Truffle",
      ],
      level: "Advanced",
      projects: 4,
    },
    {
      id: "19",
      title: "SQL & Database Design Mastery",
      description:
        "Master SQL for data analysis and software development. Deep dive into PostgreSQL, MySQL, and database normalization.",
      instructor: "Jose Portilla",
      duration: "22 hours",
      students: 22500,
      rating: 4.9,
      category: "Database",
      image:
        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&h=400&fit=crop",
      topics: [
        "SQL Syntax & Queries",
        "Joins, Unions & Group By",
        "Database Design & Normalization",
        "PostgreSQL Advanced Features",
        "Performance Tuning",
        "Stored Procedures",
      ],
      level: "Beginner",
      projects: 12,
    },
    {
      id: "20",
      title: "Software Testing & Automation (Selenium)",
      description:
        "Learn Manual and Automation Testing. Master Selenium WebDriver with Java, TestNG, and Maven for robust QA.",
      instructor: "Rahul Shetty",
      duration: "34 hours",
      students: 9800,
      rating: 4.7,
      category: "Quality Assurance",
      image:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
      topics: [
        "SDLC & STLC",
        "Selenium WebDriver",
        "TestNG Framework",
        "Page Object Model (POM)",
        "Jenkins Integration",
        "API Testing",
      ],
      level: "Intermediate",
      projects: 6,
    },
  ];

  // ========== DOM CACHE ==========
  const DOM = {};

  const cacheDOM = () => {
    DOM.navbar = document.getElementById("navbar");
    DOM.searchInput = document.getElementById("search-input");
    DOM.coursesGrid = document.getElementById("courses-grid");
    DOM.noResults = document.getElementById("no-results");
    DOM.placementsGrid = document.getElementById("placements-grid");
    DOM.loginModal = document.getElementById("login-modal");
    DOM.loginForm = document.getElementById("login-form");
    DOM.emailInput = document.getElementById("email");
    DOM.passwordInput = document.getElementById("password");
    DOM.emailError = document.getElementById("email-error");
    DOM.passwordError = document.getElementById("password-error");
    DOM.submitBtn = document.getElementById("submit-btn");
    DOM.themeToggle = document.getElementById("theme-toggle");
    DOM.hamburgerBtn = document.getElementById("hamburger-btn");
    DOM.mobileMenu = document.getElementById("mobile-menu");
    DOM.modalBackdrop = document.getElementById("modal-backdrop");
    DOM.modalClose = document.getElementById("modal-close");
  };

  const formatNumber = (num) =>
    num >= 1000
      ? (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K"
      : num.toString();

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // ========== RENDER COURSES ==========
  const renderCourses = (coursesToRender) => {
    if (!DOM.coursesGrid) return;

    if (coursesToRender.length === 0) {
      DOM.coursesGrid.innerHTML = "";
      DOM.noResults.classList.add("courses__empty--visible");
      return;
    }

    DOM.noResults.classList.remove("courses__empty--visible");

    DOM.coursesGrid.innerHTML = coursesToRender
      .map(
        (course, index) => `
      <article class="card" data-id="${course.id}" data-title="${course.title}" style="animation-delay: ${index * 80}ms">
        <div class="card__image-wrapper">
          <img src="${course.image}" alt="${course.title}" class="card__image" loading="lazy">
          <span class="card__badge">${course.category}</span>
          <span class="card__level">${course.level}</span>
        </div>
        <div class="card__content">
          <h3 class="card__title">${course.title}</h3>
          <p class="card__description">${course.description}</p>
          <p class="card__instructor">By <span class="card__instructor-name">${course.instructor}</span></p>
          
          <div class="card__stats">
            <span class="card__stat">
              <svg class="card__stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${course.duration}
            </span>
            <span class="card__stat">
              <svg class="card__stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              ${formatNumber(course.students)}
            </span>
            <span class="card__stat card__stat--rating">
              <svg class="card__stat-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              ${course.rating}
            </span>
          </div>

          <div class="card__meta">
            <span class="card__meta-item">
              <svg class="card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              ${course.topics.length} Modules
            </span>
            <span class="card__meta-item">
              <svg class="card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              ${course.projects} ${course.projects > 20 ? "Problems" : "Projects"}
            </span>
            <span class="card__meta-item">
              <svg class="card__meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Certificate
            </span>
          </div>

          <button class="card__topics-toggle" type="button" aria-expanded="false">
            <span>What you'll learn</span>
            <svg class="card__topics-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div class="card__topics">
            <ul class="card__topics-list">
              ${course.topics
                .map(
                  (topic) => `
                <li class="card__topics-item">
                  <span class="card__topics-check">✓</span>
                  <span>${topic}</span>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
        </div>
        <div class="card__footer">
          <button class="card__enroll-btn" type="button">Enroll Now - Free</button>
        </div>
      </article>
    `,
      )
      .join("");
  };

  const renderPlacements = () => {
    if (!DOM.placementsGrid) return;

    DOM.placementsGrid.innerHTML = companies
      .map(
        (company, index) => `
      <div class="placements__company" style="animation-delay: ${index * 30}ms">
        <img 
          src="${company.logo}" 
          alt="${company.name} logo"
          class="placements__company-logo"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
        <span class="placements__company-fallback">${company.name}</span>
      </div>
    `,
      )
      .join("");
  };

  const handleSearch = (query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      renderCourses(courses);
      return;
    }

    const filtered = courses.filter((course) => {
      const searchText =
        `${course.title} ${course.category} ${course.instructor} ${course.description} ${course.topics.join(" ")}`.toLowerCase();
      return searchText.includes(normalizedQuery);
    });

    renderCourses(filtered);
  };

  const debouncedSearch = debounce(handleSearch, 150);

  const initTheme = () => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.body.classList.add("dark");
    }
  };

  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const toggleMobileMenu = () => {
    DOM.mobileMenu?.classList.toggle("navbar__mobile--open");
  };

  const closeMobileMenu = () => {
    DOM.mobileMenu?.classList.remove("navbar__mobile--open");
  };

  const openModal = () => {
    DOM.loginModal?.classList.add("modal--open");
    document.body.style.overflow = "hidden";
    DOM.emailInput?.focus();
  };

  const closeModal = () => {
    DOM.loginModal?.classList.remove("modal--open");
    document.body.style.overflow = "";
    resetForm();
  };

  const resetForm = () => {
    DOM.loginForm?.reset();
    if (DOM.emailError) DOM.emailError.textContent = "";
    if (DOM.passwordError) DOM.passwordError.textContent = "";
    DOM.emailInput?.classList.remove("form-group__input--error");
    DOM.passwordInput?.classList.remove("form-group__input--error");
    DOM.submitBtn?.classList.remove("btn--loading");
    if (DOM.submitBtn) DOM.submitBtn.disabled = false;

    if (passwordValidator && passwordValidator.container) {
      passwordValidator.container.style.opacity = "0";
      passwordValidator.container.style.transform = "translateY(-10px)";
    }
  };

  const validateForm = (email, password) => {
    const errors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(email))
      errors.email = "Please enter a valid email";

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {

      if (passwordValidator) {
        const analysis = passwordValidator.analyzePassword(password);
        const { results, score } = analysis;
        const missing = [];
        if (!results.lowercase) missing.push("lowercase");
        if (!results.uppercase) missing.push("uppercase");
        if (!results.number) missing.push("number");
        if (!results.special) missing.push("special character");
        if (!results.length) missing.push("length (8+)");
        if (score < 50) {
          if (missing.length) {
            errors.password =
              "Make your password stronger. Missing: " + missing.join(", ");
          } else {
            errors.password =
              "Password is still weak; try adding more unique characters or length.";
          }
        }
      } else {
        if (password.length < 6)
          errors.password = "Password must be at least 6 characters";
      }
    }

    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = DOM.emailInput?.value || "";
    const password = DOM.passwordInput?.value || "";
    const errors = validateForm(email, password);

    if (DOM.emailError) DOM.emailError.textContent = "";
    if (DOM.passwordError) DOM.passwordError.textContent = "";
    DOM.emailInput?.classList.remove("form-group__input--error");
    DOM.passwordInput?.classList.remove("form-group__input--error");

    if (errors.email) {
      if (DOM.emailError) DOM.emailError.textContent = errors.email;
      DOM.emailInput?.classList.add("form-group__input--error");
    }
    if (errors.password) {
      if (DOM.passwordError) DOM.passwordError.textContent = errors.password;
      DOM.passwordInput?.classList.add("form-group__input--error");
    }

    if (errors.email || errors.password) return;

    if (DOM.submitBtn) {
      DOM.submitBtn.classList.add("btn--loading");
      DOM.submitBtn.disabled = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(`Welcome back! You're now signed in as ${email}`);
    closeModal();
  };

  const initEventDelegation = () => {
    DOM.coursesGrid?.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".card__topics-toggle");
      if (toggleBtn) {
        const card = toggleBtn.closest(".card");
        const topics = card?.querySelector(".card__topics");
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

        toggleBtn.setAttribute("aria-expanded", !isExpanded);
        toggleBtn.classList.toggle("card__topics-toggle--active");
        topics?.classList.toggle("card__topics--expanded");
        return;
      }

      const enrollBtn = e.target.closest(".card__enroll-btn");
      if (enrollBtn) {
        const card = enrollBtn.closest(".card");
        const title = card?.dataset.title;
        alert(`Enrolling in "${title}"! Redirecting to registration...`);
      }
    });

    DOM.mobileMenu?.addEventListener("click", (e) => {
      if (e.target.classList.contains("navbar__mobile-link")) closeMobileMenu();
    });
  };

  const handleScroll = () => {
    DOM.navbar?.classList.toggle("navbar--scrolled", window.scrollY > 20);
  };

  const bindEvents = () => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    DOM.searchInput?.addEventListener("input", (e) =>
      debouncedSearch(e.target.value),
    );
    DOM.themeToggle?.addEventListener("click", toggleTheme);
    DOM.hamburgerBtn?.addEventListener("click", toggleMobileMenu);

    document.getElementById("login-btn")?.addEventListener("click", openModal);
    document
      .getElementById("mobile-login-btn")
      ?.addEventListener("click", () => {
        closeMobileMenu();
        openModal();
      });

    DOM.modalClose?.addEventListener("click", closeModal);
    DOM.modalBackdrop?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeMobileMenu();
      }
    });

    DOM.loginForm?.addEventListener("submit", handleLogin);

    DOM.emailInput?.addEventListener("input", () => {
      if (DOM.emailError) DOM.emailError.textContent = "";
      DOM.emailInput?.classList.remove("form-group__input--error");
    });

    DOM.passwordInput?.addEventListener("input", () => {
      if (DOM.passwordError) DOM.passwordError.textContent = "";
      DOM.passwordInput?.classList.remove("form-group__input--error");

      if (passwordValidator && passwordValidator.container) {
        passwordValidator.container.style.opacity = "1";
        passwordValidator.container.style.transform = "translateY(0)";
      }
    });
  };

  const init = () => {
    initTheme();
    cacheDOM();

    passwordValidator = new PasswordValidator();

    renderCourses(courses);
    renderPlacements();
    bindEvents();
    initEventDelegation();
    handleScroll();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


