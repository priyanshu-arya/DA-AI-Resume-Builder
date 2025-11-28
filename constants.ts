import { ResumeData } from './types';

export const INITIAL_RESUME_STATE: ResumeData = {
  personalInfo: {
    fullName: "Alex Developer",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexdev",
    website: "alex.dev",
    summary: "Experienced Full Stack Developer with a passion for building scalable web applications. Proven track record of delivering high-quality code and optimizing system performance."
  },
  skills: [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "GraphQL"
  ],
  experience: [
    {
      id: "exp-1",
      company: "Tech Solutions Inc.",
      position: "Senior Frontend Engineer",
      startDate: "2021-01",
      endDate: "Present",
      location: "Remote",
      description: "• Led the migration of a legacy monolithic application to a micro-frontend architecture using React and Module Federation.\n• Improved site performance by 40% through code splitting and lazy loading strategies.\n• Mentored junior developers and conducted code reviews to ensure best practices."
    },
    {
      id: "exp-2",
      company: "WebCorp",
      position: "Software Developer",
      startDate: "2018-06",
      endDate: "2020-12",
      location: "New York, NY",
      description: "• Developed and maintained multiple client-facing web applications using Vue.js and Laravel.\n• Collaborated with UX/UI designers to implement responsive and accessible designs.\n• Integrated third-party APIs for payment processing and data analytics."
    }
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Technology",
      degree: "B.S. Computer Science",
      startDate: "2014-09",
      endDate: "2018-05",
      location: "Boston, MA",
      description: "Graduated with Honors. Member of the ACM Student Chapter.",
      gpa: "3.8/4.0",
      coursework: "Data Structures, Algorithms, Distributed Systems, Artificial Intelligence"
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "E-commerce Dashboard",
      technologies: "React, Redux, Firebase",
      link: "github.com/alex/dashboard",
      date: "2022-08 - 2022-12",
      description: "• Built a comprehensive dashboard for online retailers to manage inventory.\n• Implemented real-time data visualization using D3.js.\n• Integrated Stripe API for secure payment processing."
    }
  ],
  awards: [
    {
      id: "awd-1",
      title: "Outstanding Innovation Award",
      issuer: "Tech Solutions Inc.",
      date: "2022-11",
      description: "Recognized for developing a custom caching solution that saved the company $50k annually in server costs."
    }
  ],
  certificates: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-03"
    }
  ]
};

export const RESUME_TIPS = [
  "Quantify your impact using numbers (e.g., 'Increased sales by 20%' or 'Reduced load time by 3s'). Data speaks louder than words.",
  "Use active action verbs like 'Spearheaded', 'Engineered', 'Orchestrated' instead of passive phrases like 'Responsible for'.",
  "Tailor your resume for every job application using specific keywords found in the Job Description (JD).",
  "Ensure your contact information is up-to-date and professional. Avoid unprofessional email addresses.",
  "Limit your resume to 1 page if you have less than 10 years of experience. Recruiters scan resumes in 6 seconds.",
  "Focus on achievements, not just duties. What did you *accomplish* in that role?",
  "Save your resume as a PDF to ensure formatting stays consistent across all devices and ATS software.",
  "Remove references available upon request. Save that space for more skills or experience.",
  "Include a link to your LinkedIn profile or Portfolio, but make sure they are up-to-date.",
  "Avoid using personal pronouns like 'I', 'Me', or 'My' in your bullet points."
];