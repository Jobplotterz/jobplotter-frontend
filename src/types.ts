export interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
}

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "Jane Doe",
    jobTitle: "Senior Software Engineer",
    email: "jane.doe@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "janedoe.dev",
    summary: "Experienced software engineer with a passion for building scalable web applications and leading high-performing teams.",
  },
  experience: [
    {
      id: "1",
      company: "Tech Innovators Inc.",
      position: "Senior Frontend Engineer",
      startDate: "Jan 2021",
      endDate: "Present",
      description: "Led the migration of a legacy monolithic application to a modern React-based micro-frontend architecture. Improved page load times by 40% and developer productivity by 25%.",
    },
    {
      id: "2",
      company: "Web Solutions LLC",
      position: "Frontend Developer",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      description: "Developed and maintained responsive web applications using React and Redux. Collaborated closely with designers to implement pixel-perfect UIs.",
    }
  ],
  education: [
    {
      id: "1",
      institution: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      startDate: "Aug 2014",
      endDate: "May 2018",
    }
  ],
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "GraphQL", "AWS"],
};
