const fs = require('fs');
const path = require('path');

const departments = [
  { id: "bca", name: "Computer Science (BCA)", code: "BCA", icon: "laptop", color: "#3B82F6", category: "Computing & IT" },
  { id: "botany", name: "Botany", code: "BOT", icon: "sprout", color: "#10B981", category: "Life Sciences" },
  { id: "chemistry", name: "Chemistry", code: "CHEM", icon: "flask-conical", color: "#F59E0B", category: "Physical Sciences" },
  { id: "physics", name: "Physics", code: "PHY", icon: "atom", color: "#6366F1", category: "Physical Sciences" },
  { id: "zoology", name: "Zoology", code: "ZOO", icon: "bug", color: "#EC4899", category: "Life Sciences" },
  { id: "biotech", name: "Biotechnology (BBT)", code: "BBT", icon: "dna", color: "#8B5CF6", category: "Life Sciences" },
  { id: "commerce", name: "Commerce (B.Com)", code: "B.COM", icon: "bar-chart-3", color: "#14B8A6", category: "Commerce & Management" },
  { id: "economics", name: "Economics", code: "ECO", icon: "trending-up", color: "#06B6D4", category: "Social Sciences" },
  { id: "education", name: "Education", code: "EDU", icon: "book-open", color: "#F97316", category: "Humanities" },
  { id: "english", name: "English", code: "ENG", icon: "feather", color: "#E11D48", category: "Humanities & Languages" },
  { id: "history", name: "History", code: "HIST", icon: "landmark", color: "#A855F7", category: "Social Sciences" },
  { id: "polsci", name: "Political Science", code: "POL", icon: "scale", color: "#3B82F6", category: "Social Sciences" },
  { id: "sociology", name: "Sociology", code: "SOC", icon: "users", color: "#10B981", category: "Social Sciences" },
  { id: "bsw", name: "Social Work (BSW)", code: "BSW", icon: "heart-handshake", color: "#EF4444", category: "Social Services" }
];

const semesters = [
  { number: 1, year: "FY", label: "Sem 1 (FY)" },
  { number: 2, year: "FY", label: "Sem 2 (FY)" },
  { number: 3, year: "SY", label: "Sem 3 (SY)" },
  { number: 4, year: "SY", label: "Sem 4 (SY)" },
  { number: 5, year: "TY", label: "Sem 5 (TY)" },
  { number: 6, year: "TY", label: "Sem 6 (TY)" }
];

// Helper to generate full realistic subjects
const subjectBlueprints = [
  // 1. Computer Science (BCA)
  // Major
  { dept: 'bca', track: 'major', sem: 1, code: 'BCA101', name: 'Programming Fundamentals with C', short: 'C Programming', credits: 4,
    desc: 'Core fundamentals of procedural programming, pointers, memory allocation, algorithms, and file handling in C.',
    modules: [
      { num: 1, title: 'Introduction to Algorithms & Flowcharts', weightage: '12 Marks', summary: 'Problem solving paradigms, pseudocode, conditional structures.' },
      { num: 2, title: 'Control Statements & Loops', weightage: '14 Marks', summary: 'While, for, do-while loops, branching and switch-case.' },
      { num: 3, title: 'Arrays, Strings & 2D Matrices', weightage: '16 Marks', summary: 'Array storage, multidimensional arrays, string manipulation functions.' },
      { num: 4, title: 'Pointers & Dynamic Memory Allocation', weightage: '18 Marks', summary: 'Pointer arithmetic, malloc, calloc, realloc, and free.' },
      { num: 5, title: 'Structures, Unions & Preprocessors', weightage: '12 Marks', summary: 'User-defined data types, nested structs, macro definitions.' },
      { num: 6, title: 'File Handling & Low-Level I/O', weightage: '12 Marks', summary: 'File pointers, sequential and random access, error handling.' }
    ],
    impQ: [
      { q: 'Explain dynamic memory allocation functions (malloc, calloc, realloc, free) with syntax and memory diagrams.', marks: 10, freq: 'Repeated 4 Times in DBCM Exam', hint: 'State signatures, null-checks, heap memory layout, and memory leaks.' },
      { q: 'Differentiate between call by value and call by reference using a swap function in C.', marks: 8, freq: 'DBCM Mid-Sem & End-Sem Regular', hint: 'Provide full C code with pointer arguments and stack diagrams.' },
      { q: 'Write a C program to multiply two 3x3 matrices with proper dimension validation.', marks: 10, freq: 'Asked in Winter 2023 Paper', hint: 'Show row-column dot product loops and boundary checks.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 1, code: 'BCA102', name: 'Computer Architecture & Digital Logic', short: 'Computer Org', credits: 4,
    desc: 'Combinational logic, flip-flops, Von Neumann architecture, instruction pipelines, and memory hierarchies.',
    modules: [
      { num: 1, title: 'Number Systems & Boolean Algebra', weightage: '14 Marks', summary: 'Binary, octal, hex conversions, Karnaugh maps (K-Maps).' },
      { num: 2, title: 'Combinational Logic Circuits', weightage: '16 Marks', summary: 'Adders, subtractors, multiplexers, decoders, encoders.' },
      { num: 3, title: 'Sequential Logic & Counters', weightage: '16 Marks', summary: 'SR, JK, D, T flip-flops, registers, synchronous counters.' },
      { num: 4, title: 'CPU Architecture & Micro-operations', weightage: '14 Marks', summary: 'ALU, accumulator, instruction cycles, addressing modes.' },
      { num: 5, title: 'Memory Hierarchy & Cache Memory', weightage: '14 Marks', summary: 'SRAM, DRAM, cache mapping techniques, virtual memory.' },
      { num: 6, title: 'Input-Output Organization & DMA', weightage: '12 Marks', summary: 'Interrupts, polling, DMA controller architecture.' }
    ],
    impQ: [
      { q: 'Simplify the 4-variable Boolean function using K-Map and draw the NAND-only logic circuit.', marks: 10, freq: 'High Yield Paper 2024', hint: 'Group 1s into quads/octets, identify prime implicants.' },
      { q: 'Explain Cache Memory Mapping Techniques (Direct, Associative, Set-Associative) with comparisons.', marks: 10, freq: 'DBCM Exam Regular', hint: 'Show block diagrams, tag bits, line offsets, and hit ratio formulas.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 2, code: 'BCA201', name: 'Data Structures & Algorithms', short: 'DSA', credits: 4,
    desc: 'Linear and non-linear data structures: Linked lists, stacks, queues, trees, graphs, hashing, and sorting algorithms.',
    modules: [
      { num: 1, title: 'Asymptotic Analysis & Arrays', weightage: '12 Marks', summary: 'Big-O, Big-Omega, Theta notations, array traversal and searching.' },
      { num: 2, title: 'Stacks & Queues Applications', weightage: '16 Marks', summary: 'Infix to postfix conversion, circular queue, priority queue.' },
      { num: 3, title: 'Linked Lists (Singly, Doubly, Circular)', weightage: '16 Marks', summary: 'Node manipulation, pointer traversal, polynomial addition.' },
      { num: 4, title: 'Trees, BST & AVL Trees', weightage: '18 Marks', summary: 'Binary tree traversals, BST insertions/deletions, AVL tree balance factors.' },
      { num: 5, title: 'Graphs & Graph Traversals (BFS, DFS)', weightage: '14 Marks', summary: 'Adjacency matrix, adjacency lists, shortest path algorithms.' },
      { num: 6, title: 'Sorting, Searching & Hashing', weightage: '12 Marks', summary: 'QuickSort, MergeSort, Hash tables, collision resolution.' }
    ],
    impQ: [
      { q: 'Write complete algorithms for inserting and deleting nodes in an AVL tree with rotation examples.', marks: 12, freq: 'High Yield DBCM Question', hint: 'Explain LL, RR, LR, and RL rotations with balance factor diagrams.' },
      { q: 'Convert Infix expression (A + B * C) / (D - E) to Postfix using stack tabular representation.', marks: 8, freq: 'Repeated 3 Times', hint: 'Create columns: Token, Action, Stack, Output String.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 2, code: 'BCA202', name: 'Object-Oriented Programming with Java', short: 'Core Java', credits: 4,
    desc: 'Classes, objects, inheritance, polymorphism, interfaces, exception handling, multithreading, and collections framework.',
    modules: [
      { num: 1, title: 'OOP Principles & Java Basics', weightage: '12 Marks', summary: 'Encapsulation, inheritance, polymorphism, JVM architecture.' },
      { num: 2, title: 'Classes, Objects & Constructors', weightage: '14 Marks', summary: 'Constructor overloading, this keyword, static members.' },
      { num: 3, title: 'Inheritance & Interfaces', weightage: '16 Marks', summary: 'Abstract classes, method overriding, super keyword, multiple inheritance.' },
      { num: 4, title: 'Exception Handling & Custom Exceptions', weightage: '14 Marks', summary: 'Try-catch-finally blocks, throw vs throws, custom exception classes.' },
      { num: 5, title: 'Multithreading & Synchronization', weightage: '16 Marks', summary: 'Thread lifecycle, Runnable interface, synchronized blocks, deadlocks.' },
      { num: 6, title: 'Java Collections Framework', weightage: '14 Marks', summary: 'ArrayList, LinkedList, HashMap, HashSet, Iterator interface.' }
    ],
    impQ: [
      { q: 'Explain Java Exception Handling mechanism with try, catch, finally, throw, and throws keywords.', marks: 10, freq: 'Asked in Every DBCM Semester Exam', hint: 'Draw exception hierarchy (Throwable, Exception, RuntimeException).' },
      { q: 'What is Multithreading in Java? Explain Thread lifecycle and thread synchronization with code.', marks: 10, freq: 'High Yield Question', hint: 'Show New, Runnable, Blocked, Waiting, Terminated states.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 3, code: 'BCA301', name: 'Database Management Systems (DBMS)', short: 'DBMS', credits: 4,
    desc: 'Relational database model, SQL queries, ER diagrams, normalization (1NF to BCNF), transaction management, and ACID properties.',
    modules: [
      { num: 1, title: 'DBMS Architecture & ER Modeling', weightage: '14 Marks', summary: 'Three-schema architecture, ER diagrams, primary/foreign keys.' },
      { num: 2, title: 'Relational Algebra & Calculus', weightage: '14 Marks', summary: 'Select, project, join, set operations, tuple relational calculus.' },
      { num: 3, title: 'Structured Query Language (SQL)', weightage: '18 Marks', summary: 'DDL, DML, DCL, subqueries, group by, joins, stored procedures.' },
      { num: 4, title: 'Relational Database Normalization', weightage: '16 Marks', summary: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF decomposition.' },
      { num: 5, title: 'Transaction Processing & ACID', weightage: '16 Marks', summary: 'ACID properties, serializability, two-phase locking (2PL).' },
      { num: 6, title: 'Database Recovery & Indexing', weightage: '12 Marks', summary: 'Log-based recovery, checkpoints, B-Trees and B+ Trees.' }
    ],
    impQ: [
      { q: 'Explain Normalization from 1NF to BCNF with a practical employee-department table example.', marks: 12, freq: 'Top High-Yield DBCM Question', hint: 'Define functional dependencies and loss-less join decomposition.' },
      { q: 'What are ACID properties? Explain how concurrency control prevents dirty read and lost update anomalies.', marks: 10, freq: 'Repeated 5 Times', hint: 'Detail Atomicity, Consistency, Isolation, Durability.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 4, code: 'BCA401', name: 'Web Technologies & Full-Stack Development', short: 'Web Tech', credits: 4,
    desc: 'Modern web architectures: HTML5/CSS3, JavaScript ES6+, React.js frontend, Node.js/Express backend, and REST APIs.',
    modules: [
      { num: 1, title: 'HTML5, CSS3 & Responsive Design', weightage: '12 Marks', summary: 'Semantic HTML, Flexbox, CSS Grid, media queries.' },
      { num: 2, title: 'JavaScript ES6+ & DOM Manipulation', weightage: '16 Marks', summary: 'Arrow functions, promises, async/await, closures, fetch API.' },
      { num: 3, title: 'Frontend Frameworks (React.js)', weightage: '18 Marks', summary: 'JSX, components, hooks (useState, useEffect), state management.' },
      { num: 4, title: 'Backend Development with Node.js & Express', weightage: '16 Marks', summary: 'Middleware, routing, HTTP request-response lifecycle.' },
      { num: 5, title: 'RESTful API Design & MongoDB Integration', weightage: '16 Marks', summary: 'CRUD endpoints, Mongoose models, JWT authentication.' },
      { num: 6, title: 'Web Security & Deployment', weightage: '12 Marks', summary: 'CORS, XSS, CSRF prevention, Git and cloud deployment.' }
    ],
    impQ: [
      { q: 'Explain React Component Lifecycle and state management using useState and useEffect hooks with code.', marks: 10, freq: 'DBCM 2024 Exam Paper', hint: 'Compare class lifecycle with hooks dependency arrays.' },
      { q: 'How does Node.js Event Loop work? Explain non-blocking asynchronous I/O architecture.', marks: 10, freq: 'High Yield Paper', hint: 'Diagram libuv, event queue, call stack, worker threads.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 5, code: 'BCA501', name: 'Computer Networks & Security', short: 'Networks', credits: 4,
    desc: 'OSI 7-layer model, TCP/IP, IP addressing, routing algorithms, cryptographic ciphers, and firewalls.',
    modules: [
      { num: 1, title: 'Network Models & Physical Layer', weightage: '12 Marks', summary: 'OSI vs TCP/IP models, transmission media, modulation.' },
      { num: 2, title: 'Data Link Layer & Framing', weightage: '14 Marks', summary: 'Error detection (CRC), sliding window protocols, Ethernet.' },
      { num: 3, title: 'Network Layer & IP Addressing', weightage: '18 Marks', summary: 'IPv4, IPv6, subnetting, CIDR, OSPF and BGP routing.' },
      { num: 4, title: 'Transport Layer & Congestion Control', weightage: '16 Marks', summary: 'TCP 3-way handshake, UDP, flow control, congestion window.' },
      { num: 5, title: 'Application Layer Protocols', weightage: '14 Marks', summary: 'DNS, HTTP/HTTPS, FTP, SMTP, DHCP services.' },
      { num: 6, title: 'Network Security & Cryptography', weightage: '14 Marks', summary: 'RSA algorithm, symmetric ciphers, SSL/TLS, firewalls.' }
    ],
    impQ: [
      { q: 'Compare OSI 7-Layer Model with TCP/IP Model with functions of every single layer.', marks: 10, freq: 'DBCM Core Exam Question', hint: 'Draw layer comparison diagram with PDU names.' },
      { q: 'Perform IPv4 Subnetting: Given IP 192.168.10.0/24, create 4 usable subnets and list range of valid hosts.', marks: 10, freq: 'Numerical High Yield', hint: 'Show borrow bits, subnet mask /26, network/broadcast addresses.' }
    ]
  },
  { dept: 'bca', track: 'major', sem: 6, code: 'BCA601', name: 'Artificial Intelligence & Machine Learning', short: 'AI & ML', credits: 4,
    desc: 'Search heuristics, knowledge representation, supervised and unsupervised learning, neural networks, and model evaluation.',
    modules: [
      { num: 1, title: 'Introduction to AI & Agent Architecture', weightage: '12 Marks', summary: 'Intelligent agents, environments, problem spaces.' },
      { num: 2, title: 'Heuristic Search Strategies', weightage: '16 Marks', summary: 'A* search, minimax algorithm, alpha-beta pruning.' },
      { num: 3, title: 'Supervised Learning Algorithms', weightage: '18 Marks', summary: 'Linear regression, logistic regression, decision trees, SVM.' },
      { num: 4, title: 'Unsupervised Learning & Clustering', weightage: '16 Marks', summary: 'K-Means clustering, hierarchical clustering, PCA dimensionality reduction.' },
      { num: 5, title: 'Artificial Neural Networks', weightage: '16 Marks', summary: 'Perceptrons, multi-layer perceptron, backpropagation algorithm.' },
      { num: 6, title: 'Model Evaluation & Ethical AI', weightage: '12 Marks', summary: 'Precision, recall, F1-score, ROC curves, bias and fairness.' }
    ],
    impQ: [
      { q: 'Explain A* Search algorithm with admissibility and consistency of heuristic functions.', marks: 10, freq: 'DBCM Final Exam Paper', hint: 'State f(n) = g(n) + h(n), provide 8-puzzle or graph search example.' },
      { q: 'Derive Backpropagation weight update rule in a Multi-Layer Feedforward Neural Network.', marks: 12, freq: 'High Yield Regular Question', hint: 'Apply chain rule of partial derivatives on Mean Squared Error.' }
    ]
  },
  // BCA Minor Subjects
  { dept: 'bca', track: 'minor', sem: 1, code: 'BCAM101', name: 'IT Fundamentals & Office Automation', short: 'IT Basics (Minor)', credits: 3,
    desc: 'Introductory course for non-computing students covering personal computers, operating systems, MS Office tools, and digital literacy.',
    modules: [
      { num: 1, title: 'Computer Hardware & System Software', weightage: '15 Marks', summary: 'CPU, RAM, storage, OS roles, GUI vs CLI.' },
      { num: 2, title: 'Word Processing & Professional Documents', weightage: '18 Marks', summary: 'Formatting, styles, tables, mail merge.' },
      { num: 3, title: 'Spreadsheet Calculation & Formulas', weightage: '20 Marks', summary: 'Formulas, VLOOKUP, pivot tables, data visualization.' },
      { num: 4, title: 'Digital Presentations & Public Speaking Tools', weightage: '15 Marks', summary: 'Slide master, animations, export formats.' },
      { num: 5, title: 'Internet, Email & Cloud Collaboration', weightage: '16 Marks', summary: 'Google Drive, OneDrive, web safety, netiquette.' },
      { num: 6, title: 'Information Security Essentials', weightage: '16 Marks', summary: 'Passwords, two-factor authentication, phishing defense.' }
    ],
    impQ: [
      { q: 'Explain the Mail Merge feature in Microsoft Word with step-by-step instructions.', marks: 8, freq: 'DBCM Minor Paper Regular', hint: 'List: main document, data source, merge fields, finish.' },
      { q: 'What is VLOOKUP in Excel? Explain its syntax and give a clear example with a student marksheet.', marks: 10, freq: 'High Yield Practical Exam', hint: 'Detail lookup_value, table_array, col_index, range_lookup.' }
    ]
  },
  { dept: 'bca', track: 'minor', sem: 2, code: 'BCAM201', name: 'Web Designing & HTML5/CSS3', short: 'Web Design (Minor)', credits: 3,
    desc: 'Creation of modern responsive web pages without programming prerequisites. HTML5 semantics, CSS styling, flexbox, and site publishing.',
    modules: [
      { num: 1, title: 'Introduction to Internet & Web Browsers', weightage: '14 Marks', summary: 'Domain names, DNS, URLs, HTTP basics.' },
      { num: 2, title: 'HTML5 Semantic Layouts', weightage: '18 Marks', summary: 'Header, nav, main, section, article, footer, forms.' },
      { num: 3, title: 'CSS3 Styling & Typography', weightage: '18 Marks', summary: 'Colors, fonts, box model, margins, borders, padding.' },
      { num: 4, title: 'Responsive Design & Flexbox', weightage: '18 Marks', summary: 'Media queries, flex container and item properties.' },
      { num: 5, title: 'Images, Media & Embeds', weightage: '16 Marks', summary: 'Audio, video, iframes, SVG graphics.' },
      { num: 6, title: 'Website Publishing & Free Hosting', weightage: '16 Marks', summary: 'GitHub Pages, Netlify deployment basics.' }
    ],
    impQ: [
      { q: 'Explain CSS Box Model with a neat labeled diagram showing margin, border, padding, and content.', marks: 8, freq: 'DBCM Exam Regular', hint: 'Draw nested boxes and calculate total element width.' }
    ]
  },
  { dept: 'bca', track: 'minor', sem: 3, code: 'BCAM301', name: 'Introduction to Python for Non-Majors', short: 'Python Minor', credits: 3,
    desc: 'Gentle introduction to scripting with Python: syntax, conditionals, loops, lists, dictionaries, and automated file tasks.',
    modules: [
      { num: 1, title: 'Python Syntax & Variables', weightage: '15 Marks', summary: 'Data types, input/output, operators.' },
      { num: 2, title: 'Decision Making & Iteration', weightage: '18 Marks', summary: 'If-elif-else, for loops, while loops, break, continue.' },
      { num: 3, title: 'Python Collections (Lists, Tuples, Dictionaries)', weightage: '20 Marks', summary: 'List comprehensions, dict operations, key-value lookup.' },
      { num: 4, title: 'Functions & Reusable Code', weightage: '16 Marks', summary: 'Defining functions, default arguments, return values.' },
      { num: 5, title: 'File Reading & Simple Automation', weightage: '16 Marks', summary: 'Reading text and CSV files, writing output.' },
      { num: 6, title: 'Basic Data Visualization with Matplotlib', weightage: '15 Marks', summary: 'Bar charts, line graphs, pie charts.' }
    ],
    impQ: [
      { q: 'Differentiate between List and Dictionary in Python with syntax and sample code.', marks: 8, freq: 'DBCM Minor Regular', hint: 'Show mutable sequence vs hash table key-value pairs.' }
    ]
  },
  { dept: 'bca', track: 'minor', sem: 4, code: 'BCAM401', name: 'Cyber Security & Digital Safety', short: 'Cyber Safety (Minor)', credits: 3,
    desc: 'Understanding cyber threats, identity theft, malware, safe social media practices, and Indian Cyber Laws (IT Act 2000).',
    modules: [
      { num: 1, title: 'Cyber Threats & Social Engineering', weightage: '16 Marks', summary: 'Phishing, vishing, impersonation attacks.' },
      { num: 2, title: 'Malware & Ransomware Defense', weightage: '18 Marks', summary: 'Viruses, worms, trojans, ransomware mitigation.' },
      { num: 3, title: 'Password Security & Safe Browsing', weightage: '18 Marks', summary: 'Password managers, MFA, cookie security, VPNs.' },
      { num: 4, title: 'Social Media Privacy & Identity Theft', weightage: '16 Marks', summary: 'Profile hardening, fraud prevention, digital footprint.' },
      { num: 5, title: 'Online Financial Fraud & UPI Safety', weightage: '16 Marks', summary: 'Safe banking practices, reporting unauthorized transactions.' },
      { num: 6, title: 'Indian IT Act 2000 & Cyber Grievance Reporting', weightage: '16 Marks', summary: 'Legal penalties, cyber crime cell reporting.' }
    ],
    impQ: [
      { q: 'Explain Phishing and Spear-Phishing attacks. How can everyday computer users protect themselves?', marks: 10, freq: 'High Yield DBCM Question', hint: 'Detail fake URLs, email headers, MFA, and red flags.' }
    ]
  }
];

// Department Subject Generator for remaining departments to give rich, authentic 14-dept curriculum
const deptTemplates = [
  // 2. Botany
  {
    dept: 'botany',
    major: [
      { sem: 1, code: 'BOT101', name: 'Plant Diversity & Cryptogams', short: 'Cryptogams', credits: 4, desc: 'Study of non-flowering plants: Algae, Fungi, Bryophytes, and Pteridophytes with evolutionary morphology.' },
      { sem: 1, code: 'BOT102', name: 'Microbiology & Plant Pathology', short: 'Plant Pathology', credits: 4, desc: 'Bacterial and viral plant pathogens, disease cycles, immunity mechanisms, and crop defense.' },
      { sem: 2, code: 'BOT201', name: 'Anatomy & Embryology of Angiosperms', short: 'Plant Anatomy', credits: 4, desc: 'Internal tissue systems, secondary growth, microsporogenesis, megasporogenesis, and fertilization.' },
      { sem: 3, code: 'BOT301', name: 'Plant Taxonomy & Systematic Botany', short: 'Taxonomy', credits: 4, desc: 'Principles of plant classification (Bentham & Hooker, APG), herbarium techniques, and botanical nomenclature.' },
      { sem: 4, code: 'BOT401', name: 'Plant Physiology & Metabolism', short: 'Plant Physiology', credits: 4, desc: 'Water relations, photosynthesis (C3, C4, CAM), respiration, nitrogen metabolism, and phytohormones.' },
      { sem: 5, code: 'BOT501', name: 'Plant Biotechnology & Tissue Culture', short: 'Tissue Culture', credits: 4, desc: 'Callus induction, micropropagation, somaclonal variation, cryopreservation, and transgenic crops.' },
      { sem: 6, code: 'BOT601', name: 'Economic Botany & Ethnobotany', short: 'Economic Botany', credits: 4, desc: 'Cereals, pulses, timber, spices, medicinal flora, and indigenous tribal botanical knowledge.' }
    ],
    minor: [
      { sem: 1, code: 'BOTM101', name: 'Gardening, Nursery & Floriculture', short: 'Gardening Minor', credits: 3, desc: 'Practical gardening skills, potting mixtures, vegetative propagation, and commercial flower growing.' },
      { sem: 2, code: 'BOTM201', name: 'Biofertilizers & Organic Farming', short: 'Biofertilizers', credits: 3, desc: 'Rhizobium, Mycorrhiza, blue-green algae, vermicomposting, and sustainable crop nutrition.' },
      { sem: 3, code: 'BOTM301', name: 'Medicinal Plants & Home Herbal Remedies', short: 'Medicinal Plants', credits: 3, desc: 'Identification, active constituents, and cultivation of Tulsi, Neem, Aloe Vera, and Ashwagandha.' },
      { sem: 4, code: 'BOTM401', name: 'Mushroom Cultivation Technology', short: 'Mushroom Tech', credits: 3, desc: 'Spawn production, substrate preparation, harvest and processing of Button and Oyster mushrooms.' }
    ]
  },

  // 3. Chemistry
  {
    dept: 'chemistry',
    major: [
      { sem: 1, code: 'CHE101', name: 'Inorganic Chemistry: Atomic Structure & Bonding', short: 'Inorganic Chem I', credits: 4, desc: 'Schrodinger equation, periodic trends, ionic and covalent bonding, VSEPR, and MO theory.' },
      { sem: 1, code: 'CHE102', name: 'Organic Chemistry: Stereochemistry & Mechanisms', short: 'Organic Chem I', credits: 4, desc: 'IUPAC nomenclature, optical isomerism, conformation of alkanes, reactive intermediates (carbocations).' },
      { sem: 2, code: 'CHE201', name: 'Physical Chemistry: Thermodynamics & Chemical Kinetics', short: 'Physical Chem I', credits: 4, desc: 'First and second laws of thermodynamics, Carnot cycle, reaction rate equations, and Arrhenius equation.' },
      { sem: 3, code: 'CHE301', name: 'Transition Elements & Coordination Chemistry', short: 'Coordination Chem', credits: 4, desc: 'Werner theory, crystal field theory (CFT), Jahn-Teller effect, and magnetic properties of complexes.' },
      { sem: 4, code: 'CHE401', name: 'Quantum Chemistry & Molecular Spectroscopy', short: 'Spectroscopy', credits: 4, desc: 'Rotational, vibrational (IR), electronic (UV-Vis) spectroscopy, and NMR spectroscopy fundamentals.' },
      { sem: 5, code: 'CHE501', name: 'Synthetic Organic Chemistry & Heterocycles', short: 'Organic Synthesis', credits: 4, desc: 'Named reactions (Aldol, Claisen, Wittig), heterocyclic compounds, and green chemistry principles.' },
      { sem: 6, code: 'CHE601', name: 'Polymer Chemistry & Material Science', short: 'Polymer Chem', credits: 4, desc: 'Polymerization mechanisms, molecular weight determination, conducting polymers, and nanomaterials.' }
    ],
    minor: [
      { sem: 1, code: 'CHEM101', name: 'Chemistry in Everyday Life', short: 'Everyday Chem Minor', credits: 3, desc: 'Chemical principles in soaps, detergents, cosmetics, plastics, food additives, and domestic hygiene.' },
      { sem: 2, code: 'CHEM201', name: 'Environmental Chemistry & Pollution Analysis', short: 'Env Chemistry', credits: 3, desc: 'Water quality parameters (BOD, COD), greenhouse effect, acid rain, and heavy metal toxicity testing.' },
      { sem: 3, code: 'CHEM301', name: 'Food Chemistry & Adulteration Testing', short: 'Food Chem', credits: 3, desc: 'Nutritional biochemistry, food preservatives, artificial sweeteners, and simple chemical tests for adulterants.' },
      { sem: 4, code: 'CHEM401', name: 'Pharmaceutical Chemistry & OTC Formulations', short: 'Pharma Chem Minor', credits: 3, desc: 'Drug action, antipyretics, antibiotics, analgesics, antacids, and dosage delivery systems.' }
    ]
  },

  // 4. Physics
  {
    dept: 'physics',
    major: [
      { sem: 1, code: 'PHY101', name: 'Mechanics & General Properties of Matter', short: 'Mechanics', credits: 4, desc: 'Newtonian mechanics, rotational dynamics, central forces, elasticity, fluid dynamics, and surface tension.' },
      { sem: 1, code: 'PHY102', name: 'Mathematical Physics & Vectors', short: 'Math Physics', credits: 4, desc: 'Vector calculus, gradient, divergence, curl, line and surface integrals, and differential equations.' },
      { sem: 2, code: 'PHY201', name: 'Thermal Physics & Statistical Mechanics', short: 'Thermal Physics', credits: 4, desc: 'Laws of thermodynamics, entropy, Maxwell-Boltzmann, Bose-Einstein, and Fermi-Dirac distributions.' },
      { sem: 3, code: 'PHY301', name: 'Electricity, Magnetism & Electromagnetic Theory', short: 'Electromagnetism', credits: 4, desc: 'Gauss law, Biot-Savart law, Ampere law, Maxwell equations, and electromagnetic wave propagation.' },
      { sem: 4, code: 'PHY401', name: 'Optics, Wave Propagation & Lasers', short: 'Optics & Lasers', credits: 4, desc: 'Interference, diffraction, polarization, optical fibers, and laser stimulation principles.' },
      { sem: 5, code: 'PHY501', name: 'Quantum Mechanics & Modern Physics', short: 'Quantum Physics', credits: 4, desc: 'Wave-particle duality, Heisenberg uncertainty, particle in a box, and harmonic oscillator.' },
      { sem: 6, code: 'PHY601', name: 'Solid State Physics & Nuclear Physics', short: 'Solid State & Nuclear', credits: 4, desc: 'Crystal lattices, X-ray diffraction, band theory of solids, nuclear fission, and radioactivity.' }
    ],
    minor: [
      { sem: 1, code: 'PHYM101', name: 'Everyday Physics & Gadget Mechanics', short: 'Everyday Physics', credits: 3, desc: 'Physical principles behind refrigerators, smartphones, microwave ovens, motors, and LED lamps.' },
      { sem: 2, code: 'PHYM201', name: 'Fundamentals of Astronomy & Space Science', short: 'Astronomy Minor', credits: 3, desc: 'Solar system, stellar evolution, black holes, telescopes, and satellite orbits.' },
      { sem: 3, code: 'PHYM301', name: 'Renewable Energy & Solar Technologies', short: 'Solar Tech', credits: 3, desc: 'Photovoltaic cells, solar thermal energy, wind turbines, and energy storage batteries.' },
      { sem: 4, code: 'PHYM401', name: 'Physics of Sound, Acoustics & Music', short: 'Acoustics Minor', credits: 3, desc: 'Sound waves, musical scales, decibels, architectural acoustics, and noise reduction.' }
    ]
  },

  // 5. Zoology
  {
    dept: 'zoology',
    major: [
      { sem: 1, code: 'ZOO101', name: 'Non-Chordata Diversity & Classification', short: 'Non-Chordates', credits: 4, desc: 'Comparative morphology and organization of Protozoa, Porifera, Coelenterata, Annelida, and Arthropoda.' },
      { sem: 1, code: 'ZOO102', name: 'Biosystematics & Animal Evolution', short: 'Animal Evolution', credits: 4, desc: 'Theories of evolution (Darwinism, Synthetic theory), speciation, fossil records, and zoogeography.' },
      { sem: 2, code: 'ZOO201', name: 'Chordata Anatomy & Functional Biology', short: 'Chordates', credits: 4, desc: 'Comparative anatomy of fishes, amphibians, reptiles, birds, and mammals.' },
      { sem: 3, code: 'ZOO301', name: 'Animal Physiology & Endocrinology', short: 'Physiology', credits: 4, desc: 'Digestion, circulation, respiration, neural transmission, and hormonal regulatory feedback.' },
      { sem: 4, code: 'ZOO401', name: 'Biochemistry, Cell Biology & Genetics', short: 'Cell & Genetics', credits: 4, desc: 'Mendelian genetics, chromosome mapping, cellular organelles, and biomolecular pathways.' },
      { sem: 5, code: 'ZOO501', name: 'Immunology, Parasitology & Animal Disease', short: 'Immunology', credits: 4, desc: 'Innate and adaptive immunity, antibodies, antigens, malarial parasite, and helminth infections.' },
      { sem: 6, code: 'ZOO601', name: 'Fisheries & Applied Aquaculture', short: 'Fisheries', credits: 4, desc: 'Commercial fish species, hatchery management, induced breeding, fish feeds, and pond ecology.' }
    ],
    minor: [
      { sem: 1, code: 'ZOOM101', name: 'Apiculture, Sericulture & Vermicomposting', short: 'Applied Zoology Minor', credits: 3, desc: 'Honeybee keeping, silkworm rearing, and organic compost production from earthworms.' },
      { sem: 2, code: 'ZOOM201', name: 'Wildlife Conservation & National Parks of India', short: 'Wildlife Minor', credits: 3, desc: 'Project Tiger, endangered fauna, biosphere reserves, and wildlife protection laws.' },
      { sem: 3, code: 'ZOOM301', name: 'Aquarium Management & Ornamental Fishes', short: 'Aquarium Keeping', credits: 3, desc: 'Freshwater ornamental fish breeding, aquarium plants, filtration, and water quality testing.' },
      { sem: 4, code: 'ZOOM401', name: 'Public Health, Vector Control & Sanitation', short: 'Public Health', credits: 3, desc: 'Mosquito and rodent borne diseases, vector eradication, safe sanitation, and preventive healthcare.' }
    ]
  },

  // 6. Biotechnology (BBT)
  {
    dept: 'biotech',
    major: [
      { sem: 1, code: 'BBT101', name: 'Cell Biology & Biomolecules', short: 'Cell & Biomolecules', credits: 4, desc: 'Cellular ultrastructure, membrane transport, proteins, lipids, carbohydrates, and nucleic acids.' },
      { sem: 1, code: 'BBT102', name: 'Microbial Physiology & Fermentation Basics', short: 'Microbiology', credits: 4, desc: 'Bacterial growth kinetics, staining methods, sterilization, and industrial microbe strains.' },
      { sem: 2, code: 'BBT201', name: 'Molecular Biology & Gene Expression', short: 'Molecular Biology', credits: 4, desc: 'DNA replication, transcription, translation, genetic code, and operon models in prokaryotes/eukaryotes.' },
      { sem: 3, code: 'BBT301', name: 'Recombinant DNA Technology & Gene Cloning', short: 'rDNA Tech', credits: 4, desc: 'Restriction enzymes, cloning vectors (plasmids, phages), PCR, DNA sequencing, and genomic libraries.' },
      { sem: 4, code: 'BBT401', name: 'Bioprocess Engineering & Downstream Processing', short: 'Bioprocess Engg', credits: 4, desc: 'Bioreactor design, aeration, scale-up, cell disruption, chromatography, and product crystallization.' },
      { sem: 5, code: 'BBT501', name: 'Immunotechnology & Diagnostic Methods', short: 'Immunotech', credits: 4, desc: 'ELISA, Western blotting, monoclonal antibodies, flow cytometry, and vaccine development.' },
      { sem: 6, code: 'BBT601', name: 'Genomics, Proteomics & Bioinformatics', short: 'Bioinformatics', credits: 4, desc: 'BLAST, sequence alignments, phylogenetic trees, molecular docking, and mass spectrometry.' }
    ],
    minor: [
      { sem: 1, code: 'BBTM101', name: 'Introduction to Biotechnology in Medicine', short: 'Medical Biotech Minor', credits: 3, desc: 'Recombinant insulin, gene therapy, diagnostics, and modern healthcare breakthroughs.' },
      { sem: 2, code: 'BBTM201', name: 'Forensic Science & DNA Fingerprinting', short: 'Forensic DNA', credits: 3, desc: 'Crime scene biological evidence, STR analysis, paternity testing, and legal admissibility.' },
      { sem: 3, code: 'BBTM301', name: 'Food & Beverage Biotechnology', short: 'Food Biotech', credits: 3, desc: 'Dairy fermentation, probiotics, brewing technology, and food enzyme applications.' },
      { sem: 4, code: 'BBTM401', name: 'Bioethics, Biosafety & Intellectual Property', short: 'Bioethics & IPR', credits: 3, desc: 'GMO regulations, patenting biological inventions, clinical trial ethics, and Cartagena protocol.' }
    ]
  },

  // 7. Commerce (B.Com)
  {
    dept: 'commerce',
    major: [
      { sem: 1, code: 'BCOM101', name: 'Financial Accounting - I', short: 'Financial Accounts', credits: 4, desc: 'Accounting standards, journal, ledger, trial balance, depreciation methods, and final accounts.' },
      { sem: 1, code: 'BCOM102', name: 'Business Organization & Modern Management', short: 'Business Org', credits: 4, desc: 'Forms of business ownership, planning, organizing, staffing, directing, and controlling principles.' },
      { sem: 2, code: 'BCOM201', name: 'Corporate Accounting & Company Accounts', short: 'Corporate Accounts', credits: 4, desc: 'Issue and redemption of shares and debentures, valuation of goodwill, and corporate financial statements.' },
      { sem: 3, code: 'BCOM301', name: 'Cost Accounting & Budgetary Control', short: 'Cost Accounting', credits: 4, desc: 'Elements of cost, cost sheets, tender pricing, process costing, marginal costing, and break-even analysis.' },
      { sem: 4, code: 'BCOM401', name: 'Income Tax Law & Direct Tax Practices', short: 'Income Tax', credits: 4, desc: 'Heads of income (Salaries, House Property, Capital Gains), deductions under Chapter VI-A, and ITR filing.' },
      { sem: 5, code: 'BCOM501', name: 'Goods & Services Tax (GST) & Indirect Taxes', short: 'GST Framework', credits: 4, desc: 'CGST, SGST, IGST, input tax credit (ITC), reverse charge mechanism, and GST portal compliance.' },
      { sem: 6, code: 'BCOM601', name: 'Financial Management & Capital Markets', short: 'Financial Mgmt', credits: 4, desc: 'Time value of money, capital budgeting (NPV, IRR), cost of capital, working capital management.' }
    ],
    minor: [
      { sem: 1, code: 'BCOMM101', name: 'Personal Financial Planning & Wealth Building', short: 'Personal Finance', credits: 3, desc: 'Savings habits, emergency funds, life and health insurance, PPF, NPS, and financial goal setting.' },
      { sem: 2, code: 'BCOMM201', name: 'Stock Markets, Mutual Funds & Equity Investing', short: 'Stock Markets', credits: 3, desc: 'BSE, NSE, Demat accounts, SIPs, equity mutual funds, index funds, and technical/fundamental analysis.' },
      { sem: 3, code: 'BCOMM301', name: 'Fundamentals of Marketing & Brand Building', short: 'Marketing Minor', credits: 3, desc: 'Marketing mix (4 Ps), consumer behavior, digital branding, social media marketing, and sales promotion.' },
      { sem: 4, code: 'BCOMM401', name: 'Entrepreneurship & Startup Management', short: 'Startups & MSME', credits: 3, desc: 'Business plan generation, pitch decks, seed funding, angel investors, and government MSME schemes.' }
    ]
  },

  // 8. Economics
  {
    dept: 'economics',
    major: [
      { sem: 1, code: 'ECO101', name: 'Microeconomic Theory: Consumer & Market Analysis', short: 'Microeconomics I', credits: 4, desc: 'Consumer equilibrium, indifference curves, elasticity of demand, production functions, and cost curves.' },
      { sem: 1, code: 'ECO102', name: 'Mathematical Methods for Economists', short: 'Math for Econ', credits: 4, desc: 'Functions, derivatives, partial differentiation, matrix algebra, and constrained optimization.' },
      { sem: 2, code: 'ECO201', name: 'Macroeconomics: National Income & Aggregate Output', short: 'Macroeconomics I', credits: 4, desc: 'GDP, GNP, circular flow of income, classical vs Keynesian output determination, and multiplier.' },
      { sem: 3, code: 'ECO301', name: 'Market Structures & Factor Pricing', short: 'Microeconomics II', credits: 4, desc: 'Perfect competition, monopoly, monopolistic competition, oligopoly models (Cournot, Sweezy), wage theories.' },
      { sem: 4, code: 'ECO401', name: 'Monetary Economics & Public Finance', short: 'Money & Banking', credits: 4, desc: 'Money supply metrics (M1-M4), RBI monetary policy tools, repo rate, taxation principles, and public debt.' },
      { sem: 5, code: 'ECO501', name: 'Indian Economy: Structural Shifts & Growth', short: 'Indian Economy', credits: 4, desc: 'Agriculture reforms, industrial policy, service sector boom, poverty, unemployment, and NITI Aayog.' },
      { sem: 6, code: 'ECO601', name: 'International Trade & Global Finance', short: 'International Trade', credits: 4, desc: 'Comparative advantage, Heckscher-Ohlin theorem, tariffs, balance of payments, WTO, and IMF.' }
    ],
    minor: [
      { sem: 1, code: 'ECOM101', name: 'Economic Principles in Everyday Decisions', short: 'Everyday Economics', credits: 3, desc: 'Opportunity cost, incentives, inflation effects, supply-demand dynamics, and behavioral economics.' },
      { sem: 2, code: 'ECOM201', name: 'Indian Banking System & Financial Inclusion', short: 'Banking Minor', credits: 3, desc: 'Commercial banks, cooperative banks, Jan Dhan Yojana, UPI payment revolution, and microfinance.' },
      { sem: 3, code: 'ECOM301', name: 'Environmental Economics & Climate Policy', short: 'Climate Economics', credits: 3, desc: 'Carbon tax, cap-and-trade systems, sustainable development goals (SDGs), and ecological valuation.' },
      { sem: 4, code: 'ECOM401', name: 'Globalization & Contemporary World Economy', short: 'Global Economy', credits: 3, desc: 'Multinational corporations, exchange rate fluctuations, trade wars, and global supply chains.' }
    ]
  },

  // 9. Education
  {
    dept: 'education',
    major: [
      { sem: 1, code: 'EDU101', name: 'Philosophical Foundations of Education', short: 'Philosophy of Edu', credits: 4, desc: 'Idealism, Naturalism, Pragmatism, and educational contributions of Gandhi, Tagore, and Dewey.' },
      { sem: 1, code: 'EDU102', name: 'Sociological Foundations of Education', short: 'Sociology of Edu', credits: 4, desc: 'Education as an agent of social change, modernization, equalization of opportunities, and culture.' },
      { sem: 2, code: 'EDU201', name: 'Psychological Foundations of Learning', short: 'Educational Psych', credits: 4, desc: 'Theories of learning (Pavlov, Skinner, Piaget, Vygotsky), intelligence, motivation, and personality.' },
      { sem: 3, code: 'EDU301', name: 'Curriculum Planning & Instructional Design', short: 'Curriculum Design', credits: 4, desc: 'Curriculum models, Bloom taxonomy of learning objectives, lesson planning, and teaching strategies.' },
      { sem: 4, code: 'EDU401', name: 'Educational Measurement & Evaluation', short: 'Assessment & Tests', credits: 4, desc: 'Formative and summative assessment, standardized tests, validity, reliability, and grading systems.' },
      { sem: 5, code: 'EDU501', name: 'Inclusive Education & Special Pedagogical Needs', short: 'Inclusive Education', credits: 4, desc: 'Teaching students with learning disabilities, visual/hearing impairments, and gifted children.' },
      { sem: 6, code: 'EDU601', name: 'Educational Leadership & School Management', short: 'School Management', credits: 4, desc: 'Institutional planning, academic supervision, school climate, teacher evaluation, and RTE Act.' }
    ],
    minor: [
      { sem: 1, code: 'EDUM101', name: 'Life Skills Education & Personal Effectiveness', short: 'Life Skills Minor', credits: 3, desc: 'WHO 10 core life skills, stress management, critical thinking, empathy, and interpersonal skills.' },
      { sem: 2, code: 'EDUM201', name: 'Early Childhood Care & Development', short: 'Early Childhood', credits: 3, desc: 'Play-way methodology, cognitive development milestones, preschool nutrition, and safety.' },
      { sem: 3, code: 'EDUM301', name: 'Educational Technology & Digital Learning Tools', short: 'EdTech Tools', credits: 3, desc: 'Smart classroom boards, LMS platforms (Moodle, Google Classroom), educational podcasts, and gamification.' },
      { sem: 4, code: 'EDUM401', name: 'Guidance & Psychological Counselling Basics', short: 'Counselling Minor', credits: 3, desc: 'Career counselling techniques, adolescent behavioural issues, peer pressure, and student support.' }
    ]
  },

  // 10. English
  {
    dept: 'english',
    major: [
      { sem: 1, code: 'ENG101', name: 'British Literature: Old English to Renaissance', short: 'Early British Lit', credits: 4, desc: 'Chaucer Canterbury Tales, Spenser, Marlowe Doctor Faustus, and Elizabethan sonneteers.' },
      { sem: 1, code: 'ENG102', name: 'Introduction to Literary Forms & Critical Terms', short: 'Literary Forms', credits: 4, desc: 'Poetic metres, tragedy, comedy, epic, ballad, irony, satire, and narrative perspectives.' },
      { sem: 2, code: 'ENG201', name: 'Shakespearean Dramas & Renaissance Theatre', short: 'Shakespeare Studies', credits: 4, desc: 'Detailed study of Hamlet, As You Like It, Othello, theatrical conventions, and soliloquies.' },
      { sem: 3, code: 'ENG301', name: 'Romantic & Victorian Literature', short: 'Romantic & Victorian', credits: 4, desc: 'Wordsworth, Keats, Shelley, Tennyson, Browning, Jane Austen, and Charles Dickens.' },
      { sem: 4, code: 'ENG401', name: 'Modern & Postmodern Literature', short: 'Modernist Lit', credits: 4, desc: 'T.S. Eliot The Waste Land, Virginia Woolf, James Joyce, Samuel Beckett, and Theatre of the Absurd.' },
      { sem: 5, code: 'ENG501', name: 'Indian Writing in English & Regional Translations', short: 'Indian English Lit', credits: 4, desc: 'R.K. Narayan, Salman Rushdie, Amitav Ghosh, Kamala Das, and translated Indian vernacular texts.' },
      { sem: 6, code: 'ENG601', name: 'Linguistics, Phonetics & English Syntax', short: 'Linguistics', credits: 4, desc: 'IPA symbols, phonemes, syllable structure, transformational generative grammar, and sociolinguistics.' }
    ],
    minor: [
      { sem: 1, code: 'ENGM101', name: 'Effective Business Communication & Professional Writing', short: 'Communication Minor', credits: 3, desc: 'Report writing, executive summaries, professional email drafting, and persuasive communication.' },
      { sem: 2, code: 'ENGM201', name: 'Creative Writing: Poetry, Fiction & Screenwriting', short: 'Creative Writing', credits: 3, desc: 'Character development, plot pacing, imagery, dialogue writing, and workshop peer review.' },
      { sem: 3, code: 'ENGM301', name: 'English for Competitive Exams & Verbal Aptitude', short: 'Verbal Aptitude', credits: 3, desc: 'Vocabulary mastery, reading comprehension speed, sentence correction, and verbal logic.' },
      { sem: 4, code: 'ENGM401', name: 'Film Appreciation & Literature Adaptations', short: 'Film Studies', credits: 3, desc: 'Cinematic language, camera angles, narrative adaptation from page to screen, and film critiques.' }
    ]
  },

  // 11. History
  {
    dept: 'history',
    major: [
      { sem: 1, code: 'HIST101', name: 'Ancient Indian History: Harappan to Mauryan Empire', short: 'Ancient India', credits: 4, desc: 'Indus Valley urbanism, Vedic culture, Mahajanapadas, Buddhism, Jainism, and Ashokan edicts.' },
      { sem: 1, code: 'HIST102', name: 'World Civilizations: Egypt, Mesopotamia & Greece', short: 'World Civilizations', credits: 4, desc: 'Nile civilization, Code of Hammurabi, Athenian democracy, Roman Republic, and ancient trade routes.' },
      { sem: 2, code: 'HIST201', name: 'Gupta Golden Age to Early Medieval India', short: 'Classical India', credits: 4, desc: 'Gupta administration, art and architecture, Harsha Vardhana, Cholas, Pallavas, and temple culture.' },
      { sem: 3, code: 'HIST301', name: 'Delhi Sultanate & The Mughal Empire', short: 'Medieval India', credits: 4, desc: 'Alauddin Khilji reforms, Akbar administrative setup (Mansabdari), revenue systems, and Mughal art.' },
      { sem: 4, code: 'HIST401', name: 'Colonial Expansion & Indian National Movement', short: 'Freedom Struggle', credits: 4, desc: '1857 Revolt, rise of nationalism, Gandhian mass satyagrahas, Subhas Chandra Bose, and 1947 Partition.' },
      { sem: 5, code: 'HIST501', name: 'Modern World: French Revolution to World War II', short: 'Modern World', credits: 4, desc: 'Industrial Revolution, American Revolution, Russian Revolution, Rise of Fascism, and Cold War origins.' },
      { sem: 6, code: 'HIST601', name: 'Historiography & Archaeological Methods', short: 'Historiography', credits: 4, desc: 'Primary and secondary sources, carbon dating, stratigraphy, epigraphy, and schools of historical thought.' }
    ],
    minor: [
      { sem: 1, code: 'HISTM101', name: 'Glimpses of Indian Heritage & Architectural Marvels', short: 'Indian Heritage', credits: 3, desc: 'UNESCO World Heritage sites of India, cave temples, medieval forts, and colonial landmarks.' },
      { sem: 2, code: 'HISTM201', name: 'Tourism & Historical Sites of Western India', short: 'Historical Tourism', credits: 3, desc: 'Tourism potential, heritage walks, museum curation, and tourist guide competencies.' },
      { sem: 3, code: 'HISTM301', name: 'History of Science & Technology in Ancient India', short: 'History of Science', credits: 3, desc: 'Contributions of Aryabhata, Sushruta, Charaka, metallurgy (iron pillar), and ancient irrigation systems.' },
      { sem: 4, code: 'HISTM401', name: 'Freedom Fighters & Revolutionaries of India', short: 'Freedom Fighters', credits: 3, desc: 'Biographical studies of Bhagat Singh, Chandrashekhar Azad, Rani Lakshmibai, and tribal resistance.' }
    ]
  },

  // 12. Political Science
  {
    dept: 'polsci',
    major: [
      { sem: 1, code: 'POL101', name: 'Political Theory: Core Concepts & Debates', short: 'Political Theory', credits: 4, desc: 'State sovereignty, liberty, equality, justice, rights, democracy, and citizenship theories.' },
      { sem: 1, code: 'POL102', name: 'Western Political Thought: Plato to Karl Marx', short: 'Western Thought', credits: 4, desc: 'Plato Republic, Aristotle Politics, Machiavelli, Hobbes, Locke, Rousseau, and Marxian dialectics.' },
      { sem: 2, code: 'POL201', name: 'Indian Political Thought: Ancient to Modern', short: 'Indian Thought', credits: 4, desc: 'Kautilya Arthashastra, Buddhist polity, Raja Ram Mohan Roy, Tilak, Gandhi, and Dr. B.R. Ambedkar.' },
      { sem: 3, code: 'POL301', name: 'Indian Constitution: Institutional Framework & Rights', short: 'Indian Constitution', credits: 4, desc: 'Preamble, Fundamental Rights, Directive Principles, Parliamentary system, and federal dynamics.' },
      { sem: 4, code: 'POL401', name: 'Public Administration: Theory & Bureaucracy', short: 'Public Admin', credits: 4, desc: 'Principles of administration, Taylor Scientific Management, Weber Bureaucratic Model, and Good Governance.' },
      { sem: 5, code: 'POL501', name: 'International Relations & Global Geopolitics', short: 'International Relations', credits: 4, desc: 'Realism, Liberalism, Constructivism, United Nations, nuclear non-proliferation, and multipolar world.' },
      { sem: 6, code: 'POL601', name: 'India Foreign Policy & Strategic Relations', short: 'Foreign Policy', credits: 4, desc: 'Non-Alignment, Act East policy, relations with USA, China, Russia, neighboring South Asian dynamics.' }
    ],
    minor: [
      { sem: 1, code: 'POLM101', name: 'Citizen Rights & Constitutional Literacy in India', short: 'Constitutional Rights', credits: 3, desc: 'Understanding your rights, police procedures, FIR, Right to Information (RTI), and consumer protection.' },
      { sem: 2, code: 'POLM201', name: 'Human Rights, Gender Justice & Social Equity', short: 'Human Rights', credits: 3, desc: 'UDHR declaration, National Human Rights Commission (NHRC), women rights, and minority protections.' },
      { sem: 3, code: 'POLM301', name: 'Elections, Political Parties & Voting Behaviour', short: 'Electoral Politics', credits: 3, desc: 'Election Commission of India, coalition politics, EVM security, opinion polls, and voter trends.' },
      { sem: 4, code: 'POLM401', name: 'Local Self-Government & Panchayati Raj in Action', short: 'Panchayati Raj', credits: 3, desc: '73rd and 74th constitutional amendments, Gram Sabha, Zilla Parishad, municipal governance, and civic funds.' }
    ]
  },

  // 13. Sociology
  {
    dept: 'sociology',
    major: [
      { sem: 1, code: 'SOC101', name: 'Introduction to Sociology: Social Structure & Institutions', short: 'Intro to Sociology', credits: 4, desc: 'Sociological imagination, primary and secondary groups, social institutions, norms, values, and socialization.' },
      { sem: 1, code: 'SOC102', name: 'Classical Sociological Thinkers', short: 'Classical Thinkers', credits: 4, desc: 'Auguste Comte, Karl Marx (historical materialism), Emile Durkheim (suicide, division of labor), Max Weber.' },
      { sem: 2, code: 'SOC201', name: 'Sociology of Indian Society: Structure & Changes', short: 'Indian Society', credits: 4, desc: 'Caste hierarchy, sanskritization, Westernization, tribal communities, joint family evolution, and religious pluralism.' },
      { sem: 3, code: 'SOC301', name: 'Social Stratification, Mobility & Inequality', short: 'Stratification', credits: 4, desc: 'Class, caste, gender, race stratification, social mobility patterns, and affirmative action policies.' },
      { sem: 4, code: 'SOC401', name: 'Sociological Research Methods & Social Surveys', short: 'Research Methods', credits: 4, desc: 'Qualitative vs quantitative methods, questionnaires, interviews, participant observation, and ethics.' },
      { sem: 5, code: 'SOC501', name: 'Sociology of Gender, Family & Kinship', short: 'Gender & Kinship', credits: 4, desc: 'Gender vs sex, patriarchy, queer studies, domestic labor, reproductive health, and changing marital norms.' },
      { sem: 6, code: 'SOC601', name: 'Social Movements & Collective Action in Modern India', short: 'Social Movements', credits: 4, desc: 'Peasant movements, Dalit movements, feminist movements, environmental movements (Chipko, Narmada).' }
    ],
    minor: [
      { sem: 1, code: 'SOCM101', name: 'Youth, Media & Popular Culture in India', short: 'Youth & Media', credits: 3, desc: 'Impact of OTT platforms, social media identity, youth subcultures, fashion, and screen time dynamics.' },
      { sem: 2, code: 'SOCM201', name: 'Sociology of Health, Medicine & Community Wellness', short: 'Sociology of Health', credits: 3, desc: 'Social determinants of health, healthcare inequality, mental health taboos, and public health campaigns.' },
      { sem: 3, code: 'SOCM301', name: 'Gender Sensitization & Prevention of Harassment', short: 'Gender Sensitization', credits: 3, desc: 'POSH Act 2013, toxic stereotypes, workplace equality, consent education, and respectful co-existence.' },
      { sem: 4, code: 'SOCM401', name: 'Urban Life, Smart Cities & Slum Communities', short: 'Urban Studies', credits: 3, desc: 'Urbanization, rural-to-urban migration, informal economy, gentrification, and housing justice.' }
    ]
  },

  // 14. Social Work (BSW)
  {
    dept: 'bsw',
    major: [
      { sem: 1, code: 'BSW101', name: 'Introduction to Social Work: Philosophy & Professional Ethics', short: 'Social Work Intro', credits: 4, desc: 'History of social work, human dignity, social justice, NASW code of ethics, and role of professional social workers.' },
      { sem: 1, code: 'BSW102', name: 'Social Work Practice with Individuals (Case Work)', short: 'Social Case Work', credits: 4, desc: 'Case work relationship, intake interviews, psychosocial assessment, treatment planning, and termination.' },
      { sem: 2, code: 'BSW201', name: 'Social Work Practice with Groups (Group Work)', short: 'Social Group Work', credits: 4, desc: 'Group dynamics, stages of group development, therapeutic groups, leadership facilitation, and evaluation.' },
      { sem: 3, code: 'BSW301', name: 'Community Organization & Social Action', short: 'Community Org', credits: 4, desc: 'Participatory rural appraisal (PRA), power dynamics, mass mobilization, advocacy, and social reform movements.' },
      { sem: 4, code: 'BSW401', name: 'Child Rights, Child Protection & Juvenile Justice', short: 'Child Protection', credits: 4, desc: 'POCSO Act, Juvenile Justice Act, Child Welfare Committees, adoption laws, and foster care programs.' },
      { sem: 5, code: 'BSW501', name: 'Rural & Tribal Community Development in India', short: 'Rural Development', credits: 4, desc: 'Gram Panchayat development plans (GPDP), MGNREGA, Forest Rights Act, and sustainable livelihoods.' },
      { sem: 6, code: 'BSW601', name: 'Management of Non-Profit Organizations (NGOs)', short: 'NGO Management', credits: 4, desc: 'Trust and society registration, fundraising, CSR partnership proposals, FCRA compliance, and project audits.' }
    ],
    minor: [
      { sem: 1, code: 'BSWM101', name: 'Fundamentals of Volunteering & Community Service', short: 'Volunteering Minor', credits: 3, desc: 'Volunteer ethics, community outreach, blood donation camps, disaster assistance, and civic engagement.' },
      { sem: 2, code: 'BSWM201', name: 'Counselling Skills & First Contact Psychological Support', short: 'Counselling Skills', credits: 3, desc: 'Active listening, empathy vs sympathy, open-ended questioning, crisis de-escalation, and referral networks.' },
      { sem: 3, code: 'BSWM301', name: 'Geriatric Care & Senior Citizen Well-being', short: 'Elderly Care', credits: 3, desc: 'Ageing physiology, psychological loneliness, Senior Citizens Maintenance Act, and daycare initiatives.' },
      { sem: 4, code: 'BSWM401', name: 'Substance Abuse Prevention & De-addiction Support', short: 'De-addiction Support', credits: 3, desc: 'Stages of chemical addiction, alcohol and drug awareness, family intervention, and relapse prevention.' }
    ]
  }
];

// Combine all subjects
const allSubjects = [...subjectBlueprints];

deptTemplates.forEach(dt => {
  dt.major.forEach(m => {
    allSubjects.push({
      dept: dt.dept,
      track: 'major',
      sem: m.sem,
      code: m.code,
      name: m.name,
      short: m.short,
      credits: m.credits,
      desc: m.desc,
      modules: [
        { num: 1, title: 'Foundational Concepts & Principles', weightage: '14 Marks', summary: `Core theoretical basis and fundamental principles of ${m.name}.` },
        { num: 2, title: 'Governing Models & Frameworks', weightage: '16 Marks', summary: `Standard definitions, structural classifications, and methodological paradigms.` },
        { num: 3, title: 'Detailed Analytical Implementations', weightage: '18 Marks', summary: `Step-by-step mechanisms, critical proofs, and practical case evaluations.` },
        { num: 4, title: 'Applied Problem Solving & Analysis', weightage: '16 Marks', summary: `Empirical evaluations, numerical calculations, and contextual applications.` },
        { num: 5, title: 'Institutional Standards & Contemporary Debates', weightage: '14 Marks', summary: `Contemporary academic literature, practical constraints, and industry relevance.` },
        { num: 6, title: 'Advanced Innovations & Case Studies', weightage: '12 Marks', summary: `Recent developments, comparative monographs, and field implementations.` }
      ],
      impQ: [
        { q: `Explain the fundamental concepts and core theoretical significance of ${m.name} in modern academic study.`, marks: 10, freq: 'DBCM End-Sem Regular Paper', hint: 'State standard definitions, structural characteristics, and draw relevant illustrative diagrams.' },
        { q: `Discuss the governing operational models and critical comparative factors associated with ${m.name}.`, marks: 10, freq: 'High Yield Exam Question', hint: 'Detail step-by-step methodologies with appropriate real-world applications.' },
        { q: `Analyze the contemporary practical challenges and solutions in the context of ${m.name}.`, marks: 8, freq: 'DBCM Mid-Sem Exam', hint: 'Present a structured balanced argument with standard academic citations.' }
      ]
    });
  });

  dt.minor.forEach(m => {
    allSubjects.push({
      dept: dt.dept,
      track: 'minor',
      sem: m.sem,
      code: m.code,
      name: m.name,
      short: m.short,
      credits: m.credits,
      desc: m.desc,
      modules: [
        { num: 1, title: 'Introductory Principles for Interdisciplinary Learners', weightage: '15 Marks', summary: `Basic overview and practical orientation to ${m.name}.` },
        { num: 2, title: 'Core Applications & Practical Tools', weightage: '18 Marks', summary: `Essential techniques and day-to-day tools in this minor subject.` },
        { num: 3, title: 'Applied Case Analysis & Solutions', weightage: '18 Marks', summary: `Practical scenarios and hands-on case studies.` },
        { num: 4, title: 'Contemporary Trends & Community Impact', weightage: '16 Marks', summary: `Relevance to everyday life, ethical guidelines, and civic responsibility.` }
      ],
      impQ: [
        { q: `Explain the practical significance and everyday applications of ${m.name}.`, marks: 8, freq: 'DBCM Minor Regular Exam', hint: 'Provide clear, practical examples and outline key operational steps.' },
        { q: `Discuss the key guidelines and best practices learned in ${m.name} for non-specialist students.`, marks: 8, freq: 'High Yield Paper', hint: 'Highlight safety, methodology, and common real-world use cases.' }
      ]
    });
  });
});

// Format subjects into the application's standard structure
const formattedSubjects = allSubjects.map(s => {
  const deptObj = departments.find(d => d.id === s.dept) || { name: s.dept };
  
  return {
    id: `${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${(s.short || 'sub').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    code: s.code,
    name: s.name,
    shortName: s.short || s.name,
    semester: s.sem,
    track: s.track, // 'major' | 'minor'
    departmentId: s.dept,
    branches: [s.dept],
    branchId: s.dept,
    universityId: 'dbcm',
    credits: s.credits,
    scheme: `DBCM Autonomous NEP 2024 (${s.track.toUpperCase()})`,
    difficulty: s.track === 'major' ? 'Core Comprehensive' : 'Interdisciplinary Elective',
    passingProbability: '92%+',
    description: s.desc,
    modules: s.modules,
    impQuestions: s.impQ.map((q, idx) => ({
      id: `q-${s.code.toLowerCase()}-${idx + 1}`,
      module: idx + 1,
      marks: q.marks,
      frequency: q.freq,
      question: q.question,
      answerHint: q.hint
    })),
    notes: [
      { id: `n-${s.code.toLowerCase()}-1`, title: `${s.name} - Complete DBCM Department Notes`, pages: 58, author: `DBCM ${deptObj.name} Faculty`, reads: 14200 },
      { id: `n-${s.code.toLowerCase()}-2`, title: `${s.name} - Unit Summaries & Quick Revision Guide`, pages: 22, author: "DBCM Subject Cell", reads: 9800 }
    ],
    pyqs: [
      { year: "May / June 2024", session: "Summer 2024", pages: 4, paperType: `DBCM End-Semester Exam (${s.track.toUpperCase()})`, totalMarks: 80 },
      { year: "Nov / Dec 2023", session: "Winter 2023", pages: 4, paperType: `DBCM End-Semester Exam (${s.track.toUpperCase()})`, totalMarks: 80 },
      { year: "May / June 2023", session: "Summer 2023", pages: 4, paperType: `DBCM End-Semester Exam (${s.track.toUpperCase()})`, totalMarks: 80 }
    ],
    videos: [
      { channel: `DBCM ${deptObj.name} Faculty`, title: `${s.name} Complete Video Lectures`, url: "https://www.youtube.com", count: 28 },
      { channel: "Academic Masterclass", title: `${s.name} Comprehensive Review`, url: "https://www.youtube.com", count: 18 }
    ]
  };
});

// Output complete curriculum JSON
const outputData = {
  meta: {
    datasetName: "DBCM Study Material Curriculum Dataset (14 Departments - Major & Minor)",
    version: "3.0.0",
    generatedAt: new Date().toISOString(),
    totalDepartments: departments.length,
    totalSemesters: semesters.length,
    totalSubjects: formattedSubjects.length,
    departments: departments.map(d => d.name)
  },
  institution: {
    id: "dbcm",
    name: "DBCM Study Material Platform",
    shortName: "DBCM",
    badge: "Autonomous Academic Portal",
    location: "DBCM Academic Campus",
    icon: "graduation-cap",
    schemes: ["DBCM Autonomous NEP 2024", "Major-Minor Degree Framework", "CBCS Undergraduate"],
    totalStudents: "25,000+ Enrolled Students",
    rating: 4.96
  },
  departments: departments,
  semesters: semesters,
  subjects: formattedSubjects
};

const targetPath = path.join(__dirname, '..', 'data', 'curriculum.json');
fs.writeFileSync(targetPath, JSON.stringify(outputData, null, 2));

console.log(`Successfully generated curriculum with:`);
console.log(`- ${departments.length} Departments`);
console.log(`- ${semesters.length} Semesters`);
console.log(`- ${formattedSubjects.length} Total Subjects (Major & Minor)`);
