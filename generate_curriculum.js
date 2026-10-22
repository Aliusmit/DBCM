const fs = require('fs');
const path = require('path');

const universities = [
  {
    id: "mu",
    name: "University of Mumbai (MU)",
    shortName: "Mumbai University",
    badge: "Official & Popular",
    location: "Mumbai, Maharashtra",
    icon: "GraduationCap",
    schemes: ["Rev-2019 'C' Scheme", "NEP 2024", "CBCGS Rev-2016"],
    totalStudents: "1.2 Lakh+",
    rating: 4.9
  },
  {
    id: "sppu",
    name: "Savitribai Phule Pune University (SPPU)",
    shortName: "Pune University",
    badge: "Top Ranked",
    location: "Pune, Maharashtra",
    icon: "Award",
    schemes: ["2019 Pattern", "NEP 2024 Pattern"],
    totalStudents: "95,000+",
    rating: 4.8
  },
  {
    id: "gtu",
    name: "Gujarat Technological University (GTU)",
    shortName: "GTU Gujarat",
    badge: "State Tech University",
    location: "Ahmedabad, Gujarat",
    icon: "Bookmark",
    schemes: ["New Syllabus 2022", "CBCS Scheme"],
    totalStudents: "80,000+",
    rating: 4.7
  }
];

const branches = [
  { id: "comp", name: "Computer Engineering", code: "CS/CE", icon: "Laptop", color: "#3B82F6" },
  { id: "it", name: "Information Technology", code: "IT", icon: "Globe", color: "#10B981" },
  { id: "aids", name: "AI & Data Science", code: "AI&DS", icon: "Cpu", color: "#8B5CF6" },
  { id: "extc", name: "Electronics & Telecomm", code: "EXTC", icon: "Radio", color: "#F59E0B" },
  { id: "mech", name: "Mechanical Engineering", code: "MECH", icon: "Wrench", color: "#EF4444" },
  { id: "civil", name: "Civil Engineering", code: "CIVIL", icon: "Building2", color: "#06B6D4" }
];

const semesters = [
  { number: 1, year: "FE", label: "Sem 1 (FE)" },
  { number: 2, year: "FE", label: "Sem 2 (FE)" },
  { number: 3, year: "SE", label: "Sem 3 (SE)" },
  { number: 4, year: "SE", label: "Sem 4 (SE)" },
  { number: 5, year: "TE", label: "Sem 5 (TE)" },
  { number: 6, year: "TE", label: "Sem 6 (TE)" },
  { number: 7, year: "BE", label: "Sem 7 (BE)" },
  { number: 8, year: "BE", label: "Sem 8 (BE)" }
];

// Rich, authentic subjects with detailed modules, notes, and IMP questions
const subjects = [
  // --- SEMESTER 1 (FE - All Branches) ---
  {
    id: "mu-fe-sem1-maths1",
    universityId: "mu",
    branchId: "comp",
    semester: 1,
    code: "FEC101",
    name: "Engineering Mathematics - I",
    shortName: "Maths 1",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "Differential Calculus, Partial Differentiation, Expansion of Functions, Indeterminate Forms, and Complex Numbers.",
    modules: [
      { num: 1, title: "Complex Numbers & De Moivre's Theorem", weightage: "16 Marks", summary: "Hyperbolic functions, separation into real and imaginary parts, roots of complex numbers." },
      { num: 2, title: "Logarithm of Complex Quantities", weightage: "12 Marks", summary: "Principal value, general value of log(x+iy), circular and inverse hyperbolic relationships." },
      { num: 3, title: "Successive Differentiation & Leibniz Rule", weightage: "14 Marks", summary: "nth derivative of standard functions, Leibniz theorem and applications." },
      { num: 4, title: "Partial Differentiation & Euler's Theorem", weightage: "16 Marks", summary: "First and higher order partial derivatives, homogeneous functions, Euler's theorem." },
      { num: 5, title: "Applications of Partial Differentiation", weightage: "12 Marks", summary: "Jacobians, maxima and minima of functions of two variables, Lagrange multipliers." },
      { num: 6, title: "Matrices & System of Linear Equations", weightage: "10 Marks", summary: "Rank of matrix, consistency of linear system, linearly dependent and independent vectors." }
    ],
    impQuestions: [
      { id: "q1", module: 1, marks: 8, frequency: "Every Year", question: "State and prove De Moivre's Theorem. Hence find all roots of x^7 + 1 = 0.", answerHint: "Use polar form r(cosθ + i sinθ), apply e^(iθ) identities. Roots lie symmetrically on unit circle." },
      { id: "q2", module: 4, marks: 6, frequency: "May 2024, Dec 2023", question: "If u = sin^(-1)((x+y)/(sqrt(x)+sqrt(y))), prove that x*(∂u/∂x) + y*(∂u/∂y) = (1/2)*tan(u).", answerHint: "Apply Euler's theorem for homogeneous functions with degree n = 1/2." },
      { id: "q3", module: 5, marks: 8, frequency: "Dec 2024, May 2023", question: "Find maximum and minimum values of x^3 + y^3 - 3axy using Lagrange multipliers.", answerHint: "Calculate stationary points fx = 0, fy = 0, test second derivatives rt - s^2." }
    ],
    notes: [
      { id: "n1", title: "Complete Module 1-3 Summary & Formula Sheet", pages: 28, author: "Brainheaters Academic Team", reads: 14200 },
      { id: "n2", title: "Partial Differentiation Master Handwritten Notes", pages: 34, author: "Top Rankers MU", reads: 18900 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, paperType: "End-Semester Regular", totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, paperType: "End-Semester Regular", totalMarks: 80 },
      { year: "Dec 2023", session: "Winter 2023", pages: 4, paperType: "End-Semester Regular", totalMarks: 80 }
    ],
    videos: [
      { channel: "Gajendra K Purohit", title: "Engineering Mathematics 1 Full Playlist", url: "https://www.youtube.com/playlist?list=PLU6SqdYcYsfJ2iN9w8Q2x5i4VqV", count: 48 },
      { channel: "Bhagwan Singh Vishwakarma", title: "MU Maths-1 Step-by-Step", url: "https://www.youtube.com/c/BhagwanSinghVishwakarma", count: 32 }
    ]
  },
  {
    id: "mu-fe-sem1-mechanics",
    universityId: "mu",
    branchId: "comp",
    semester: 1,
    code: "FEC102",
    name: "Engineering Mechanics",
    shortName: "Mechanics",
    credits: 3.5,
    scheme: "Rev-2019 'C' Scheme",
    description: "Statics, Coplanar Forces, Trusses, Centroid, Friction, Kinematics and Kinetics of Particles.",
    modules: [
      { num: 1, title: "System of Coplanar Forces", weightage: "14 Marks", summary: "Resultant of concurrent, parallel, and non-concurrent force systems, Varignon's Theorem." },
      { num: 2, title: "Equilibrium of Coplanar Forces", weightage: "14 Marks", summary: "Free body diagrams, Lami's theorem, beam reactions, types of supports." },
      { num: 3, title: "Friction & Trusses", weightage: "12 Marks", summary: "Laws of dry friction, wedge friction, analysis of pin-jointed trusses by method of joints/sections." },
      { num: 4, title: "Centroid & Moment of Inertia", weightage: "12 Marks", summary: "Centroid of composite plane figures, parallel axis theorem, radius of gyration." },
      { num: 5, title: "Kinematics of Particles", weightage: "14 Marks", summary: "Rectilinear motion, motion curves (a-t, v-t, s-t), projectile motion, relative velocity." },
      { num: 6, title: "Kinetics of Particles", weightage: "14 Marks", summary: "D'Alembert's principle, Newton's second law, work-energy principle, impulse-momentum." }
    ],
    impQuestions: [
      { id: "qm1", module: 2, marks: 8, frequency: "Dec 2024, May 2024", question: "A cylinder of weight W is placed between two smooth inclined planes. Find contact reactions.", answerHint: "Draw FBD, identify normals perpendicular to planes, apply equations of equilibrium ΣFx=0, ΣFy=0." },
      { id: "qm2", module: 3, marks: 6, frequency: "May 2024, Dec 2023", question: "Determine the force required to raise a 500 N weight using a 10° wedge (μ = 0.25).", answerHint: "Draw separate FBDs for block and wedge, include frictional forces opposing relative motion." }
    ],
    notes: [
      { id: "nm1", title: "Engineering Mechanics Complete Derivations & Solved Numericals", pages: 52, author: "Prof. R.K. Sawant (VJTI)", reads: 22400 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 5, paperType: "Regular", totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 5, paperType: "Regular", totalMarks: 80 }
    ],
    videos: [
      { channel: "Tikle's Academy", title: "Engineering Mechanics Complete Lectures", url: "https://www.youtube.com/c/TiklesAcademy", count: 85 }
    ]
  },

  // --- SEMESTER 3 (SE - Computer Engineering / IT) ---
  {
    id: "mu-se-sem3-ds",
    universityId: "mu",
    branchId: "comp",
    semester: 3,
    code: "CSC303",
    name: "Data Structures & Algorithms",
    shortName: "Data Structures (DS)",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "Linear and non-linear data structures: Arrays, Stacks, Queues, Linked Lists, Trees, Graphs, Hashing, and Sorting techniques.",
    modules: [
      { num: 1, title: "Introduction & Algorithm Analysis", weightage: "10 Marks", summary: "Time and space complexity, asymptotic notations (Big O, Omega, Theta), Abstract Data Types." },
      { num: 2, title: "Linear Data Structures: Stacks & Queues", weightage: "16 Marks", summary: "Infix to Postfix conversion, evaluate postfix, Circular Queue, Double-ended Queue (Deque)." },
      { num: 3, title: "Linked Lists (Singly, Doubly, Circular)", weightage: "16 Marks", summary: "Insertion, deletion, traversal, polynomial representation and addition using linked lists." },
      { num: 4, title: "Trees & Binary Search Trees", weightage: "16 Marks", summary: "Tree traversals (Inorder, Preorder, Postorder), BST operations, AVL Tree rotations, Expression Trees." },
      { num: 5, title: "Graphs & Graph Traversals", weightage: "12 Marks", summary: "Adjacency matrix, adjacency list, BFS, DFS, Minimum Spanning Tree (Prim's & Kruskal's algorithms)." },
      { num: 6, title: "Hashing & Searching / Sorting Algorithms", weightage: "10 Marks", summary: "Hash functions, collision resolution (Linear probing, chaining), Quick Sort, Merge Sort, Heap Sort." }
    ],
    impQuestions: [
      { id: "qds1", module: 2, marks: 10, frequency: "Asked in Dec 2024, May 2024, Dec 2023", question: "Write a program/algorithm to convert infix expression A + (B * C - (D / E ^ F) * G) * H to postfix using a stack.", answerHint: "Follow operator precedence: ^ > * / > + -. Show stack tracing table step by step." },
      { id: "qds2", module: 4, marks: 10, frequency: "Asked in Dec 2024, May 2023", question: "Construct an AVL Tree by inserting keys: 15, 20, 24, 10, 13, 7, 30, 36, 25. Show LL, RR, LR, RL rotations.", answerHint: "Check balance factor BF = height(left) - height(right) after each insertion. Must be in {-1, 0, 1}." },
      { id: "qds3", module: 5, marks: 8, frequency: "May 2024, Dec 2022", question: "Explain BFS and DFS graph traversals with an example graph and give their time complexities.", answerHint: "BFS uses Queue (O(V+E)), DFS uses Stack/Recursion (O(V+E)). Draw step-by-step visited array." }
    ],
    notes: [
      { id: "nds1", title: "Data Structures Handwritten Blueprint & Dry-Runs", pages: 64, author: "Brainheaters Academic Team", reads: 34100 },
      { id: "nds2", title: "Tree & Graph Traversals Quick Revision Sheet", pages: 18, author: "Prof. Hemant K.", reads: 26500 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, paperType: "End-Sem Exam", totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, paperType: "End-Sem Exam", totalMarks: 80 },
      { year: "Dec 2023", session: "Winter 2023", pages: 4, paperType: "End-Sem Exam", totalMarks: 80 },
      { year: "May 2023", session: "Summer 2023", pages: 4, paperType: "End-Sem Exam", totalMarks: 80 }
    ],
    videos: [
      { channel: "Abdul Bari", title: "Mastering Data Structures & Algorithms", url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O", count: 86 },
      { channel: "Gate Smashers", title: "Data Structures Complete Course", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEwaGDPpn7Yj0qyETh_-G2", count: 65 }
    ]
  },
  {
    id: "mu-se-sem3-dsgt",
    universityId: "mu",
    branchId: "comp",
    semester: 3,
    code: "CSC302",
    name: "Discrete Structures & Graph Theory",
    shortName: "DSGT",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Sets, Relations, Functions, Posets, Lattices, Propositional & Predicate Logic, Algebraic Structures, Graph Theory, and Trees.",
    modules: [
      { num: 1, title: "Set Theory, Relations & Functions", weightage: "14 Marks", summary: "Equivalence relations, partitions, composite relations, transitive closure (Warshall's algorithm)." },
      { num: 2, title: "Posets, Hasse Diagrams & Lattices", weightage: "14 Marks", summary: "Partially ordered sets, Hasse diagram, maximal/minimal elements, complemented and distributive lattices." },
      { num: 3, title: "Logic & Proof Techniques", weightage: "14 Marks", summary: "Tautology, contradiction, normal forms (PDNF, PCNF), direct proof, contradiction, mathematical induction." },
      { num: 4, title: "Algebraic Structures & Groups", weightage: "12 Marks", summary: "Semigroups, monoids, groups, abelian groups, subgroups, Lagrange's Theorem." },
      { num: 5, title: "Graph Theory", weightage: "14 Marks", summary: "Isomorphic graphs, Euler path and circuit, Hamiltonian cycles, planar graphs, graph coloring." },
      { num: 6, title: "Trees & Recurrence Relations", weightage: "12 Marks", summary: "Spanning trees, solving linear recurrence relations with constant coefficients." }
    ],
    impQuestions: [
      { id: "qdsgt1", module: 2, marks: 8, frequency: "Every Year", question: "Draw Hasse diagram for D36 (divisors of 36) ordered by divisibility. Is it a lattice? Justify.", answerHint: "Divisors: {1, 2, 3, 4, 6, 9, 12, 18, 36}. Check every pair has unique LUB and GLB." },
      { id: "qdsgt2", module: 3, marks: 8, frequency: "Dec 2024, May 2024", question: "Obtain Principal Disjunctive Normal Form (PDNF) of (P ∧ Q) ∨ (¬P ∧ R) without truth table.", answerHint: "Expand missing variables using law of identity: (P ∧ Q ∧ (R ∨ ¬R)) ∨ (¬P ∧ R ∧ (Q ∨ ¬Q))." }
    ],
    notes: [
      { id: "ndsgt1", title: "DSGT Hasse Diagrams & Group Theory Simplified", pages: 48, author: "Brainheaters Team", reads: 27900 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Knowledge Gate", title: "Discrete Mathematics Complete", url: "https://www.youtube.com/playlist?list=PLmXKhU9FNesR1rSES7oLdJaNFgveg7446", count: 54 }
    ]
  },

  // --- SEMESTER 4 (SE - Computer Engineering) ---
  {
    id: "mu-se-sem4-aoa",
    universityId: "mu",
    branchId: "comp",
    semester: 4,
    code: "CSC402",
    name: "Analysis of Algorithms",
    shortName: "AOA",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Divide & Conquer, Greedy Method, Dynamic Programming, Backtracking, Branch & Bound, String Matching, NP-Completeness.",
    modules: [
      { num: 1, title: "Algorithm Fundamentals & Divide and Conquer", weightage: "14 Marks", summary: "Master Theorem, Merge Sort, Quick Sort, Strassen's matrix multiplication." },
      { num: 2, title: "Greedy Technique", weightage: "14 Marks", summary: "Fractional Knapsack, Job Sequencing with deadlines, Huffman Coding, Dijkstra's algorithm." },
      { num: 3, title: "Dynamic Programming", weightage: "16 Marks", summary: "0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Bellman-Ford." },
      { num: 4, title: "Backtracking", weightage: "12 Marks", summary: "N-Queens problem, Graph Coloring, Hamiltonian Cycle, Subset Sum problem." },
      { num: 5, title: "Branch and Bound", weightage: "12 Marks", summary: "15-Puzzle problem, Travelling Salesperson Problem (TSP), 0/1 Knapsack using LCBB." },
      { num: 6, title: "String Matching & Complexity Classes", weightage: "12 Marks", summary: "Rabin-Karp, Knuth-Morris-Pratt (KMP), P, NP, NP-Hard, NP-Complete concepts." }
    ],
    impQuestions: [
      { id: "qaoa1", module: 3, marks: 10, frequency: "Dec 2024, May 2024, Dec 2023", question: "Find optimal parenthesization of matrix chain product with dimensions: <5, 10, 3, 12, 5, 50, 6>. Show m and s tables.", answerHint: "Compute m[i,j] = min(m[i,k] + m[k+1,j] + p_{i-1}p_k p_j) diagonally." },
      { id: "qaoa2", module: 6, marks: 10, frequency: "May 2024, Dec 2023", question: "Explain KMP String Matching algorithm. Compute prefix table (pi table) for pattern P = 'ababcaba'.", answerHint: "Construct failure function π table where π[q] is length of longest prefix that is also proper suffix." }
    ],
    notes: [
      { id: "naoa1", title: "AOA Complete Solved Problems (DP, Greedy, Backtracking)", pages: 58, author: "Brainheaters Team", reads: 38200 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Abdul Bari", title: "Algorithms - Dynamic Programming & Greedy", url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O", count: 70 }
    ]
  },
  {
    id: "mu-se-sem4-dbms",
    universityId: "mu",
    branchId: "comp",
    semester: 4,
    code: "CSC403",
    name: "Database Management Systems",
    shortName: "DBMS",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "ER Modeling, Relational Algebra, SQL, Normalization (1NF to BCNF), Transaction Processing, Concurrency Control, and Recovery.",
    modules: [
      { num: 1, title: "Introduction & ER Model", weightage: "12 Marks", summary: "Database architecture (3-tier), ER diagrams, Extended ER features (specialization, generalization)." },
      { num: 2, title: "Relational Model & Relational Algebra", weightage: "14 Marks", summary: "Relational integrity constraints, Selection, Projection, Cartesian Product, Joins, Division." },
      { num: 3, title: "Structured Query Language (SQL)", weightage: "14 Marks", summary: "DDL, DML, DCL, nested queries, aggregate functions, joins, triggers, views." },
      { num: 4, title: "Relational Database Design & Normalization", weightage: "16 Marks", summary: "Functional dependencies, inference rules (Armstrong's axioms), 1NF, 2NF, 3NF, BCNF, lossless join." },
      { num: 5, title: "Transactions & Concurrency Control", weightage: "14 Marks", summary: "ACID properties, serializability (conflict & view), Two-Phase Locking (2PL), Timestamp ordering." },
      { num: 6, title: "Recovery & Storage Systems", weightage: "10 Marks", summary: "Log-based recovery (deferred & immediate update), Checkpoints, Indexing (B-trees, B+ trees)." }
    ],
    impQuestions: [
      { id: "qdbms1", module: 4, marks: 10, frequency: "Every Year", question: "Given relation R(A, B, C, D, E) with F = {A->BC, CD->E, B->D, E->A}. Find candidate keys and normalize to BCNF.", answerHint: "Compute attribute closures. Candidate keys are A, E, BC, CD. Decompose violations into BCNF." },
      { id: "qdbms2", module: 5, marks: 8, frequency: "Dec 2024, May 2024", question: "Explain Two-Phase Locking (2PL) protocol. Differentiate between Strict 2PL and Rigorous 2PL.", answerHint: "Growing phase and shrinking phase. Prevents cascading rollbacks and guarantees serializability." }
    ],
    notes: [
      { id: "ndbms1", title: "DBMS SQL Queries, Normalization & 2PL Master Guide", pages: 62, author: "Brainheaters Team", reads: 41200 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Gate Smashers", title: "DBMS Complete Playlist", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9AzFiCrj52vUT_O", count: 82 }
    ]
  },
  {
    id: "mu-se-sem4-os",
    universityId: "mu",
    branchId: "comp",
    semester: 4,
    code: "CSC404",
    name: "Operating Systems",
    shortName: "OS",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Process Management, CPU Scheduling, Synchronization, Deadlocks, Memory Management, Virtual Memory, and File Systems.",
    modules: [
      { num: 1, title: "Overview of Operating Systems", weightage: "10 Marks", summary: "OS structures, system calls, monolithic vs microkernel architecture." },
      { num: 2, title: "Process & Thread Management", weightage: "14 Marks", summary: "Process control block (PCB), process states, IPC, thread models." },
      { num: 3, title: "CPU Scheduling & Synchronization", weightage: "16 Marks", summary: "FCFS, SJF, Round Robin, Priority, Critical section, Semaphores, Classic IPC problems." },
      { num: 4, title: "Deadlocks", weightage: "14 Marks", summary: "Four necessary conditions, Banker's algorithm for avoidance, detection and recovery." },
      { num: 5, title: "Memory Management & Virtual Memory", weightage: "14 Marks", summary: "Paging, segmentation, page fault, Page replacement algorithms (FIFO, LRU, Optimal)." },
      { num: 6, title: "File Systems & I/O", weightage: "12 Marks", summary: "File allocation methods (contiguous, linked, indexed), Disk scheduling (SSTF, SCAN, C-SCAN)." }
    ],
    impQuestions: [
      { id: "qos1", module: 4, marks: 10, frequency: "Every Year", question: "State and solve Banker's Algorithm with Allocation, Max, and Available matrices. Determine if system is in safe state.", answerHint: "Compute Need = Max - Allocation. Trace Work and Finish vectors step by step to find safe sequence." },
      { id: "qos2", module: 5, marks: 8, frequency: "May 2024, Dec 2023", question: "Calculate page faults for reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3 using FIFO, LRU, and Optimal with 3 frames.", answerHint: "Draw frame tables for each algorithm, count hits and faults, compare performance." }
    ],
    notes: [
      { id: "nos1", title: "OS Numerical Cheatsheet: Scheduling, Banker's & Page Replacement", pages: 44, author: "Brainheaters Team", reads: 39500 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Gate Smashers", title: "Operating System Full Course", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", count: 78 }
    ]
  },

  // --- SEMESTER 5 (TE - Computer & IT) ---
  {
    id: "mu-te-sem5-cn",
    universityId: "mu",
    branchId: "comp",
    semester: 5,
    code: "CSC502",
    name: "Computer Networks",
    shortName: "CN",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "OSI and TCP/IP reference models, Physical, Data Link (Sliding Window), Network (Routing), Transport (TCP/UDP), and Application Layers.",
    modules: [
      { num: 1, title: "Network Models & Physical Layer", weightage: "10 Marks", summary: "OSI 7 layers vs TCP/IP, guided & unguided transmission media, switching techniques." },
      { num: 2, title: "Data Link Layer & Error Control", weightage: "16 Marks", summary: "Framing, CRC, Hamming code, Stop-and-Wait, Go-Back-N, Selective Repeat ARQ." },
      { num: 3, title: "Medium Access Control (MAC)", weightage: "12 Marks", summary: "Pure and Slotted ALOHA, CSMA/CD, CSMA/CA, Ethernet, IEEE 802.11 standards." },
      { num: 4, title: "Network Layer & IP Addressing", weightage: "16 Marks", summary: "IPv4 vs IPv6, Subnetting (CIDR), Routing algorithms (Distance Vector, Link State), OSPF, BGP." },
      { num: 5, title: "Transport Layer", weightage: "14 Marks", summary: "TCP 3-way handshake, TCP connection termination, Flow control, Congestion control algorithms." },
      { num: 6, title: "Application Layer & Protocols", weightage: "12 Marks", summary: "DNS, HTTP/HTTPS, FTP, SMTP, POP3, IMAP, DHCP." }
    ],
    impQuestions: [
      { id: "qcn1", module: 4, marks: 10, frequency: "Asked in Dec 2024, May 2024", question: "An organization is granted block 192.168.1.0/24. Design 4 subnets with 50 hosts each. Find subnet masks and broadcast addresses.", answerHint: "Borrow 2 bits for 4 subnets. Subnet mask = 255.255.255.192 (/26). List ranges for each subnet." },
      { id: "qcn2", module: 2, marks: 8, frequency: "May 2024, Dec 2023", question: "Given message 1101011011 and generator polynomial G(x) = x^4 + x + 1. Calculate transmitted CRC codeword.", answerHint: "Append 4 zeros, perform modulo-2 binary division, append remainder to get codeword." }
    ],
    notes: [
      { id: "ncn1", title: "Computer Networks Complete Protocols & Subnetting Guide", pages: 54, author: "Brainheaters Team", reads: 32800 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Gate Smashers", title: "Computer Networks Complete Series", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", count: 85 }
    ]
  },
  {
    id: "mu-te-sem5-tcs",
    universityId: "mu",
    branchId: "comp",
    semester: 5,
    code: "CSC501",
    name: "Theoretical Computer Science",
    shortName: "TCS",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Finite Automata (DFA/NFA), Regular Expressions, Context-Free Grammars, Pushdown Automata (PDA), and Turing Machines.",
    modules: [
      { num: 1, title: "Regular Languages & Finite Automata", weightage: "16 Marks", summary: "DFA, NFA, NFA with epsilon transitions, minimization of DFA, Arden's theorem." },
      { num: 2, title: "Regular Expressions & Pumping Lemma", weightage: "12 Marks", summary: "Converting FA to RE and RE to FA, Pumping Lemma for regular languages." },
      { num: 3, title: "Context-Free Grammars & Languages", weightage: "14 Marks", summary: "Derivation trees, ambiguity in grammars, Chomsky Normal Form (CNF), Greibach Normal Form (GNF)." },
      { num: 4, title: "Pushdown Automata (PDA)", weightage: "14 Marks", summary: "Deterministic and Non-deterministic PDA, acceptance by empty stack and final state." },
      { num: 5, title: "Turing Machines", weightage: "14 Marks", summary: "Standard Turing machine, design of TM for arithmetic and language acceptance, halting problem." },
      { num: 6, title: "Undecidability & Chomsky Hierarchy", weightage: "10 Marks", summary: "Chomsky classification (Type 0 to Type 3), Post Correspondence Problem (PCP), decidability." }
    ],
    impQuestions: [
      { id: "qtcs1", module: 5, marks: 10, frequency: "Dec 2024, May 2024, Dec 2023", question: "Design a Turing Machine to accept language L = {a^n b^n c^n | n >= 1}. Draw state transition table and diagram.", answerHint: "Mark 'a' with X, scan right to mark 'b' with Y, scan right to mark 'c' with Z, loop until blank." }
    ],
    notes: [
      { id: "ntcs1", title: "TCS Automata & Turing Machine Design Handouts", pages: 46, author: "Prof. S. Rane", reads: 29400 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Knowledge Gate", title: "Theory of Computation Full Course", url: "https://www.youtube.com/playlist?list=PLmXKhU9FNesT4tZ1zWn6s_Nl94o4z5b_c", count: 68 }
    ]
  },

  // --- SEMESTER 6 (TE - Computer / AI&DS) ---
  {
    id: "mu-te-sem6-ai",
    universityId: "mu",
    branchId: "aids",
    semester: 6,
    code: "AIDSC601",
    name: "Artificial Intelligence",
    shortName: "AI",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Informed & Uninformed Search, Adversarial Search (Minimax, Alpha-Beta), Knowledge Representation, Planning, and Uncertainty in AI.",
    modules: [
      { num: 1, title: "Introduction & Intelligent Agents", weightage: "10 Marks", summary: "Agent architectures, PEAS description, environment types (deterministic vs stochastic)." },
      { num: 2, title: "Problem Solving & Search Techniques", weightage: "16 Marks", summary: "BFS, DFS, Uniform Cost Search, A* search, IDA*, Greedy Best-First, Hill Climbing." },
      { num: 3, title: "Adversarial Search & Games", weightage: "14 Marks", summary: "Game playing, Minimax algorithm, Alpha-Beta pruning, evaluation functions." },
      { num: 4, title: "Knowledge Representation & Logic", weightage: "16 Marks", summary: "First-Order Logic, unification, resolution refutation, Forward and Backward chaining." },
      { num: 5, title: "Planning & Constraint Satisfaction", weightage: "12 Marks", summary: "STRIPS, CSP (Cryptarithmetic puzzles, Map coloring), Backtracking with forward checking." },
      { num: 6, title: "Probabilistic Reasoning & Expert Systems", weightage: "12 Marks", summary: "Bayesian Networks, conditional probability, inference in belief networks." }
    ],
    impQuestions: [
      { id: "qai1", module: 2, marks: 10, frequency: "Every Year", question: "Apply A* search to solve the 8-puzzle problem. Define admissible heuristic h1 (misplaced tiles) and h2 (Manhattan distance).", answerHint: "Prove h(n) <= h*(n). Draw state space tree showing f(n) = g(n) + h(n) at each step." },
      { id: "qai2", module: 3, marks: 10, frequency: "Dec 2024, May 2024", question: "Demonstrate Alpha-Beta pruning on a given game tree with depth 3. Identify pruned branches and terminal values.", answerHint: "Maintain α (max) and β (min). Prune subtree whenever α >= β." }
    ],
    notes: [
      { id: "nai1", title: "Artificial Intelligence A* and Alpha-Beta Step-by-Step", pages: 42, author: "Brainheaters AI Group", reads: 31000 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Gate Smashers", title: "Artificial Intelligence Complete Course", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHGhOHV-n5vKEFYng5DZrgL", count: 52 }
    ]
  },
  {
    id: "mu-te-sem6-css",
    universityId: "mu",
    branchId: "comp",
    semester: 6,
    code: "CSC603",
    name: "Cryptography & System Security",
    shortName: "CSS",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Classical Ciphers, Symmetric Encryption (DES, AES), Asymmetric Encryption (RSA, ECC), Digital Signatures, Firewalls, and IDS.",
    modules: [
      { num: 1, title: "Classical Encryption & Number Theory", weightage: "12 Marks", summary: "Monoalphabetic/Polyalphabetic ciphers, Playfair, Hill cipher, Fermat & Euler Theorems." },
      { num: 2, title: "Block Ciphers & Symmetric Cryptography", weightage: "16 Marks", summary: "DES architecture, Feistel structure, AES rounds, Modes of operation (ECB, CBC, CFB, OFB)." },
      { num: 3, title: "Public Key Cryptography", weightage: "16 Marks", summary: "Diffie-Hellman Key Exchange, RSA algorithm, Elliptic Curve Cryptography (ECC)." },
      { num: 4, title: "Integrity, Hashes & Digital Signatures", weightage: "14 Marks", summary: "MD5, SHA-512, HMAC, Digital Signature Standard (DSS/DSA), Kerberos." },
      { num: 5, title: "Network Security Protocols", weightage: "12 Marks", summary: "IPsec (AH, ESP), SSL/TLS handshake, HTTPS, PGP email security." },
      { num: 6, title: "System Security & Firewalls", weightage: "10 Marks", summary: "Buffer overflow, SQL injection, Packet filter and Proxy firewalls, Intrusion Detection (IDS)." }
    ],
    impQuestions: [
      { id: "qcss1", module: 3, marks: 10, frequency: "Every Year", question: "Perform RSA encryption and decryption with p = 7, q = 11, e = 13, and message M = 5. Find d and show full steps.", answerHint: "Compute n=77, φ(n)=60. Find d such that (d*13) mod 60 = 1 using Extended Euclidean algorithm. d=37. C=M^e mod n." }
    ],
    notes: [
      { id: "ncss1", title: "CSS Cryptography Solved Algorithms (RSA, Diffie-Hellman, DES)", pages: 50, author: "Brainheaters Team", reads: 28700 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Neso Academy", title: "Cryptography & Network Security", url: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgKU_XAO4m6F1qZzL2-Y6-E", count: 62 }
    ]
  },

  // --- SEMESTER 7 & 8 (BE) ---
  {
    id: "mu-be-sem7-ml",
    universityId: "mu",
    branchId: "comp",
    semester: 7,
    code: "CSC701",
    name: "Machine Learning",
    shortName: "ML",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Supervised Learning, Unsupervised Learning, Linear Regression, Logistic Regression, Decision Trees, SVM, Ensemble Methods, and PCA.",
    modules: [
      { num: 1, title: "Introduction to Machine Learning", weightage: "10 Marks", summary: "Types of learning, bias-variance tradeoff, overfitting, cross-validation methods." },
      { num: 2, title: "Regression & Linear Models", weightage: "16 Marks", summary: "Simple and multiple linear regression, gradient descent, cost functions, logistic regression." },
      { num: 3, title: "Tree Models & Instance-based Learning", weightage: "14 Marks", summary: "Decision trees (ID3, C4.5, Gini index), Random Forests, k-Nearest Neighbors (k-NN)." },
      { num: 4, title: "Support Vector Machines (SVM)", weightage: "14 Marks", summary: "Linear SVM, maximal margin hyperplane, soft margin, kernel trick (polynomial, RBF)." },
      { num: 5, title: "Unsupervised Learning & Clustering", weightage: "14 Marks", summary: "K-Means, Hierarchical clustering (Agglomerative), DBSCAN, Principal Component Analysis (PCA)." },
      { num: 6, title: "Ensemble Learning & Neural Networks", weightage: "12 Marks", summary: "Bagging, Boosting (AdaBoost, Gradient Boosting), Multilayer Perceptron basics." }
    ],
    impQuestions: [
      { id: "qml1", module: 3, marks: 10, frequency: "Every Year", question: "Construct a Decision Tree using ID3 algorithm with Information Gain calculations for given weather dataset.", answerHint: "Compute Entropy(S), calculate Information Gain for each attribute, select maximum gain as root." }
    ],
    notes: [
      { id: "nml1", title: "Machine Learning Math & Algorithms Handouts", pages: 56, author: "Brainheaters Team", reads: 36400 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 },
      { year: "Dec 2023", session: "Winter 2023", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "StatQuest with Josh Starmer", title: "Machine Learning Fundamentals", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaZ420UGCnp21KNEPvzK", count: 80 }
    ]
  },
  {
    id: "mu-be-sem7-bda",
    universityId: "mu",
    branchId: "comp",
    semester: 7,
    code: "CSC702",
    name: "Big Data Analytics",
    shortName: "Big Data (BDA)",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Hadoop Ecosystem, HDFS, MapReduce Programming, Apache Spark, NoSQL Databases, and Stream Analytics.",
    modules: [
      { num: 1, title: "Introduction to Big Data & Hadoop", weightage: "12 Marks", summary: "5 Vs of Big Data, Hadoop Distributed File System (HDFS), NameNode and DataNode." },
      { num: 2, title: "Hadoop Architecture & MapReduce", weightage: "16 Marks", summary: "YARN architecture, MapReduce execution flow, WordCount implementation." },
      { num: 3, title: "NoSQL Databases", weightage: "14 Marks", summary: "CAP Theorem, Key-Value, Document (MongoDB), Column-Family (HBase), Graph databases." },
      { num: 4, title: "Apache Spark Framework", weightage: "16 Marks", summary: "Resilient Distributed Datasets (RDDs), Spark architecture, transformations vs actions." },
      { num: 5, title: "Big Data Mining & Analytics", weightage: "12 Marks", summary: "Association rule mining (Apriori, PCY), PageRank algorithm, recommendation systems." },
      { num: 6, title: "Stream Processing & Visualizations", weightage: "10 Marks", summary: "Data stream architecture, DGIM algorithm for counting ones, bloom filters." }
    ],
    impQuestions: [
      { id: "qbda1", module: 2, marks: 10, frequency: "Dec 2024, Dec 2023", question: "Explain Hadoop MapReduce architecture with a clear diagram. Trace WordCount program on sample text.", answerHint: "Draw Input Split, Map, Combine, Shuffle & Sort, and Reduce stages." }
    ],
    notes: [
      { id: "nbda1", title: "Big Data Hadoop & Spark Architecture Simplified", pages: 46, author: "Brainheaters Team", reads: 27100 }
    ],
    pyqs: [
      { year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Edureka", title: "Big Data Hadoop Full Course", url: "https://www.youtube.com/playlist?list=PL9ooVrP1hQOE1c-9h9mN2qEwzP8wJ1o-Z", count: 45 }
    ]
  },
  {
    id: "mu-be-sem8-dc",
    universityId: "mu",
    branchId: "comp",
    semester: 8,
    code: "CSC801",
    name: "Distributed Computing",
    shortName: "DC",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Distributed Systems Architecture, RPC, RMI, Clock Synchronization, Distributed Mutual Exclusion, Election Algorithms, and Consensus.",
    modules: [
      { num: 1, title: "Introduction to Distributed Systems", weightage: "10 Marks", summary: "Goals, hardware & software concepts, client-server models, middleware." },
      { num: 2, title: "Communication in Distributed Systems", weightage: "16 Marks", summary: "Remote Procedure Call (RPC), Remote Method Invocation (RMI), message-oriented communication." },
      { num: 3, title: "Synchronization in Distributed Systems", weightage: "16 Marks", summary: "Lamport's logical clocks, Vector clocks, Christian's and Berkeley algorithms, Mutual exclusion." },
      { num: 4, title: "Election Algorithms & Consistency", weightage: "14 Marks", summary: "Bully algorithm, Ring algorithm, Data-centric and client-centric consistency models." },
      { num: 5, title: "Fault Tolerance & Consensus", weightage: "14 Marks", summary: "Byzantine Generals problem, two-phase commit (2PC), Paxos consensus protocol." },
      { num: 6, title: "Distributed File Systems & Case Studies", weightage: "10 Marks", summary: "NFS, Andrew File System (AFS), Google File System (GFS) concepts." }
    ],
    impQuestions: [
      { id: "qdc1", module: 3, marks: 10, frequency: "May 2024, May 2023", question: "Explain Lamport's Logical Clock algorithm with Total Order. Show timestamp calculation with 3 processes.", answerHint: "Define happens-before relation (->). Increment counter per local event and max(local, msg)+1 on receive." }
    ],
    notes: [
      { id: "ndc1", title: "Distributed Computing Algorithms & Proofs", pages: 52, author: "Brainheaters Team", reads: 24800 }
    ],
    pyqs: [
      { year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }
    ],
    videos: [
      { channel: "Gate Smashers", title: "Distributed Systems Complete Course", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEaZNWj-O_rP4f4-f8j-Q7-", count: 40 }
    ]
  },
  // --- IT BRANCH ---
  {
    id: "mu-se-sem4-it-at",
    universityId: "mu",
    branchId: "it",
    semester: 4,
    code: "ITC401",
    name: "Automata Theory & Formal Languages",
    shortName: "Automata Theory",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "Finite Automata, Regular Grammars, Pushdown Automata, Context-Free Languages, Turing Machines.",
    modules: [
      { num: 1, title: "Finite State Machines & DFA/NFA", weightage: "16 Marks", summary: "State minimization, NFA to DFA conversion, epsilon closures." },
      { num: 2, title: "Regular Expressions", weightage: "14 Marks", summary: "Equivalence of RE and FA, closure properties, Pumping Lemma." },
      { num: 3, title: "CFG & Pushdown Automata", weightage: "18 Marks", summary: "Ambiguity, Chomsky Normal Form, PDA design." }
    ],
    impQuestions: [
      { id: "qat1", module: 1, marks: 10, frequency: "Every Year", question: "Convert the following NFA with ε transitions to an equivalent DFA.", answerHint: "Compute ε-closure for each state and form subsets." }
    ],
    notes: [
      { id: "nat1", title: "Automata Theory Complete Handbook", pages: 40, author: "Brainheaters IT Wing", reads: 19800 }
    ],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Gate Smashers", title: "TOC Series", url: "https://youtube.com", count: 45 }]
  },
  {
    id: "mu-te-sem5-it-ip",
    universityId: "mu",
    branchId: "it",
    semester: 5,
    code: "ITC501",
    name: "Internet Programming (Full Stack)",
    shortName: "Internet Prog (IP)",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express, MongoDB, REST APIs.",
    modules: [
      { num: 1, title: "Frontend Basics & Modern JS", weightage: "12 Marks", summary: "DOM manipulation, ES6 features (arrow functions, promises, async/await)." },
      { num: 2, title: "React.js Framework", weightage: "18 Marks", summary: "Components, Props, State, Hooks (useState, useEffect), Virtual DOM." },
      { num: 3, title: "Server-side Node & Express", weightage: "16 Marks", summary: "RESTful architecture, middleware, routing, JWT authentication." },
      { num: 4, title: "Database Integration (MongoDB)", weightage: "14 Marks", summary: "CRUD operations, Mongoose schemas, aggregation pipelines." }
    ],
    impQuestions: [
      { id: "qip1", module: 2, marks: 10, frequency: "May 2024, Dec 2024", question: "Explain React component lifecycle and custom hooks with a functional code example.", answerHint: "Illustrate useEffect dependency array for mounting, updating, and cleanup." }
    ],
    notes: [
      { id: "nip1", title: "Full Stack Web Development Rapid Cheatsheet", pages: 45, author: "Brainheaters Tech", reads: 33400 }
    ],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Chai aur Code", title: "React & Node Full Stack Course", url: "https://youtube.com", count: 50 }]
  },

  // --- EXTC BRANCH ---
  {
    id: "mu-se-sem3-extc-edc",
    universityId: "mu",
    branchId: "extc",
    semester: 3,
    code: "ECC302",
    name: "Electronic Devices & Circuits",
    shortName: "EDC",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "PN Junction Diode, BJT Biasing, JFET, MOSFET characteristics, Small signal amplifier models.",
    modules: [
      { num: 1, title: "Diodes & Special Diodes", weightage: "14 Marks", summary: "Zener diode as voltage regulator, Varactor diode, Schottkey diode." },
      { num: 2, title: "Bipolar Junction Transistors (BJT)", weightage: "16 Marks", summary: "BJT biasing circuits (Voltage divider bias), Stability factor S." },
      { num: 3, title: "Field Effect Transistors (FET & MOSFET)", weightage: "18 Marks", summary: "Depletion and Enhancement MOSFETs, CMOS inverter, small signal analysis." }
    ],
    impQuestions: [
      { id: "qedc1", module: 2, marks: 10, frequency: "Every Year", question: "Derive expression for stability factor S for Voltage Divider Bias circuit.", answerHint: "Draw circuit diagram, apply Thevenin's theorem across base, derive S = (1+β)/(1 - β*(dIb/dIc))." }
    ],
    notes: [
      { id: "nedc1", title: "EDC Formula Sheet & Circuit Derivations", pages: 48, author: "Prof. S. Joshi", reads: 21500 }
    ],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Neso Academy", title: "Analog Electronics & EDC", url: "https://youtube.com", count: 70 }]
  },
  {
    id: "mu-se-sem4-extc-mc",
    universityId: "mu",
    branchId: "extc",
    semester: 4,
    code: "ECC402",
    name: "Microcontrollers & Embedded Systems",
    shortName: "Microcontrollers",
    credits: 3,
    scheme: "Rev-2019 'C' Scheme",
    description: "8051 Microcontroller Architecture, Instruction Set, Timers, Counters, Serial Communication, and ARM Cortex.",
    modules: [
      { num: 1, title: "8051 Architecture & Memory Organization", weightage: "16 Marks", summary: "Internal RAM, SFRs, PSW register, pin diagram." },
      { num: 2, title: "8051 Assembly Programming & Timers", weightage: "16 Marks", summary: "Addressing modes, Timer 0 & 1 modes, TMOD and TCON." },
      { num: 3, title: "Interfacing & ARM Processor", weightage: "16 Marks", summary: "Interfacing LCD, Stepper Motor, ADC/DAC, ARM 7 architecture." }
    ],
    impQuestions: [
      { id: "qmc1", module: 1, marks: 10, frequency: "Dec 2024, May 2024", question: "Draw and explain internal hardware architecture of 8051 microcontroller.", answerHint: "Include ALU, Accumulator, B register, PC, DPTR, RAM banks, and Ports 0-3." }
    ],
    notes: [{ id: "nmc1", title: "8051 Architecture & Assembly Programs Guide", pages: 42, author: "Brainheaters EXTC", reads: 18700 }],
    pyqs: [{ year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Bharat Acharya Education", title: "8051 Microcontroller Mastery", url: "https://youtube.com", count: 35 }]
  },

  // --- MECHANICAL BRANCH ---
  {
    id: "mu-se-sem3-mech-thermo",
    universityId: "mu",
    branchId: "mech",
    semester: 3,
    code: "MEC302",
    name: "Thermodynamics",
    shortName: "Thermodynamics",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "First & Second Laws of Thermodynamics, Entropy, Availability, Pure Substances, and Gas Power Cycles.",
    modules: [
      { num: 1, title: "Basic Concepts & First Law", weightage: "16 Marks", summary: "System, boundary, heat, work, Steady Flow Energy Equation (SFEE)." },
      { num: 2, title: "Second Law of Thermodynamics & Entropy", weightage: "18 Marks", summary: "Kelvin-Planck & Clausius statements, Carnot cycle, Clausius inequality." },
      { num: 3, title: "Gas Power Cycles", weightage: "16 Marks", summary: "Otto, Diesel, Dual, and Brayton cycles, air standard efficiency." }
    ],
    impQuestions: [
      { id: "qth1", module: 2, marks: 10, frequency: "Every Year", question: "Derive expression for air standard efficiency of Otto cycle with PV and TS diagrams.", answerHint: "η = 1 - (1 / r^(γ-1)). Show isentropic compression and expansion." }
    ],
    notes: [{ id: "nth1", title: "Thermodynamics Laws, Cycles & Steam Tables", pages: 56, author: "Prof. P. Patil", reads: 23100 }],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "NPTEL IIT", title: "Basic Thermodynamics", url: "https://youtube.com", count: 40 }]
  },
  {
    id: "mu-se-sem4-mech-fm",
    universityId: "mu",
    branchId: "mech",
    semester: 4,
    code: "MEC403",
    name: "Fluid Mechanics",
    shortName: "Fluid Mechanics",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "Fluid statics, buoyancy, fluid kinematics, Bernoulli's equation, viscous flow, and boundary layer theory.",
    modules: [
      { num: 1, title: "Fluid Properties & Statics", weightage: "14 Marks", summary: "Viscosity, Pascal's law, hydrostatic forces on submerged planes." },
      { num: 2, title: "Fluid Dynamics & Bernoulli's Theorem", weightage: "18 Marks", summary: "Euler's equation of motion, integration to Bernoulli's equation, Venturimeter." },
      { num: 3, title: "Laminar & Turbulent Flow", weightage: "16 Marks", summary: "Hagen-Poiseuille equation for pipe flow, Darcy-Weisbach equation." }
    ],
    impQuestions: [
      { id: "qfm1", module: 2, marks: 10, frequency: "May 2024, Dec 2023", question: "Derive Bernoulli's equation from Euler's equation of motion along a streamline.", answerHint: "State all assumptions: steady, incompressible, frictionless, along streamline." }
    ],
    notes: [{ id: "nfm1", title: "Fluid Mechanics Derivations & Solved Numericals", pages: 50, author: "Brainheaters Mech", reads: 21900 }],
    pyqs: [{ year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Tikle's Academy", title: "Fluid Mechanics Full Course", url: "https://youtube.com", count: 60 }]
  },

  // --- CIVIL BRANCH ---
  {
    id: "mu-se-sem3-civil-som",
    universityId: "mu",
    branchId: "civil",
    semester: 3,
    code: "CEC303",
    name: "Strength of Materials",
    shortName: "SOM",
    credits: 4,
    scheme: "Rev-2019 'C' Scheme",
    description: "Stress and Strain, Shear Force & Bending Moment diagrams, Bending and Shear Stresses in Beams, Torsion.",
    modules: [
      { num: 1, title: "Simple Stress, Strain & Elastic Constants", weightage: "16 Marks", summary: "Hooke's law, Poisson's ratio, bulk modulus, thermal stresses." },
      { num: 2, title: "SFD and BMD for Beams", weightage: "18 Marks", summary: "Cantilever, simply supported, overhanging beams with point load and UDL." },
      { num: 3, title: "Bending Stresses & Torsion", weightage: "16 Marks", summary: "Flexural formula σ/y = M/I = E/R, polar moment of inertia, torsion equation." }
    ],
    impQuestions: [
      { id: "qsom1", module: 2, marks: 10, frequency: "Every Year", question: "Draw SFD and BMD for simply supported beam of 6m span carrying UDL of 4 kN/m over left half and point load of 10 kN at 4m from left support.", answerHint: "Calculate support reactions, locate point of zero shear, compute maximum bending moment." }
    ],
    notes: [{ id: "nsom1", title: "SOM SFD/BMD Master Workbook", pages: 54, author: "Prof. V. Deshmukh", reads: 24200 }],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 80 }],
    videos: [{ channel: "Tikle's Academy", title: "Strength of Materials Series", url: "https://youtube.com", count: 75 }]
  },

  // --- SPPU & GTU SUBJECTS ---
  {
    id: "sppu-se-sem3-ds-algo",
    universityId: "sppu",
    branchId: "comp",
    semester: 3,
    code: "210242",
    name: "Data Structures and Algorithms (SPPU)",
    shortName: "DSA (SPPU)",
    credits: 3,
    scheme: "2019 Pattern",
    description: "SPPU pattern core algorithms: Array ADT, Sorting, Linked lists, Trees, and Graph applications.",
    modules: [
      { num: 1, title: "Linear Data Structures & Arrays", weightage: "15 Marks", summary: "Searching & sorting complexities, sparse matrix representation." },
      { num: 2, title: "Non-Linear Structures: Trees & Graphs", weightage: "20 Marks", summary: "Threaded Binary Trees, AVL trees, Dijkstra's shortest path." }
    ],
    impQuestions: [
      { id: "qsppu1", module: 2, marks: 9, frequency: "SPPU In-Sem 2024", question: "Explain Threaded Binary Tree representation with insertion algorithm.", answerHint: "Distinguish between Single Threaded and Double Threaded binary trees." }
    ],
    notes: [{ id: "nsppu1", title: "SPPU In-Sem & End-Sem Prep Blueprint", pages: 44, author: "Pune Tech Notes", reads: 16800 }],
    pyqs: [{ year: "May 2024", session: "Summer 2024", pages: 4, totalMarks: 70 }],
    videos: [{ channel: "Gate Smashers", title: "DSA SPPU Syllabus Track", url: "https://youtube.com", count: 40 }]
  },
  {
    id: "gtu-se-sem3-dbms",
    universityId: "gtu",
    branchId: "comp",
    semester: 3,
    code: "3130703",
    name: "Database Management Systems (GTU)",
    shortName: "DBMS (GTU)",
    credits: 4,
    scheme: "New Syllabus 2022",
    description: "GTU syllabus covering Data modeling, SQL, relational calculus, query optimization, and PL/SQL.",
    modules: [
      { num: 1, title: "Basic Concepts & ER Diagrams", weightage: "14 Marks", summary: "Data independence, DBA roles, ER modeling conventions." },
      { num: 2, title: "Relational Algebra & Normal Forms", weightage: "18 Marks", summary: "Join operations, functional dependencies, 1NF to BCNF." }
    ],
    impQuestions: [
      { id: "qgtu1", module: 2, marks: 7, frequency: "GTU Winter 2024", question: "Explain BCNF with a suitable example and compare it with 3NF.", answerHint: "For every non-trivial FD X -> Y, X must be a super key." }
    ],
    notes: [{ id: "ngtu1", title: "GTU Mid-Sem & Remedial IMPs Book", pages: 48, author: "Gujarat Engineering Portal", reads: 15300 }],
    pyqs: [{ year: "Dec 2024", session: "Winter 2024", pages: 4, totalMarks: 70 }],
    videos: [{ channel: "Knowledge Gate", title: "GTU DBMS Syllabus Guide", url: "https://youtube.com", count: 35 }]
  }
];

const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// 1. Write curriculum.json
const dataset = { universities, branches, semesters, subjects };
fs.writeFileSync(path.join(dataPath, 'curriculum.json'), JSON.stringify(dataset, null, 2));

// 2. Write curriculum.js
const jsContent = `/**
 * Brainheaters Comprehensive Curriculum Dataset
 * Auto-generated by Brainheaters Engineering Pipeline
 */

const curriculumData = ${JSON.stringify(dataset, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = curriculumData;
} else if (typeof window !== 'undefined') {
  window.curriculumData = curriculumData;
}
`;
fs.writeFileSync(path.join(dataPath, 'curriculum.js'), jsContent);

console.log("Successfully wrote curriculum.json and curriculum.js with " + subjects.length + " deep-dive subjects!");
