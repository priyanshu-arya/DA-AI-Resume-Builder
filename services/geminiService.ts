import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData, KeywordAnalysis, ReviewResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Overall score out of 100 based on quality and impact." },
    summary: { type: Type.STRING, description: "A brief, encouraging summary of the resume's quality." },
    improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          section: { type: Type.STRING, enum: ["personalInfo", "experience", "education", "projects", "skills", "awards"] },
          itemId: { type: Type.STRING },
          field: { type: Type.STRING },
          issue: { type: Type.STRING },
          suggestion: { type: Type.STRING }
        }
      }
    }
  }
};

const resumeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          company: { type: Type.STRING },
          position: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          location: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          location: { type: Type.STRING },
          description: { type: Type.STRING },
          gpa: { type: Type.STRING },
          cgpa: { type: Type.STRING },
          coursework: { type: Type.STRING },
        },
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          technologies: { type: Type.STRING },
          link: { type: Type.STRING },
          date: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    awards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
    certificates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          date: { type: Type.STRING },
        },
      },
    },
  },
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "A score from 0 to 100 indicating how well the resume matches the JD." },
    matchingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords from the JD found in the resume." },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords from the JD NOT found in the resume." },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice to improve the resume for this JD." },
  },
};

export const optimizeResumeWithJD = async (
  currentResume: ResumeData,
  jobDescription: string
): Promise<ResumeData> => {
  const prompt = `
    You are an expert Resume Writer.
    Analyze the JD and the Resume.
    Rewrite the resume to perfectly match the JD using high-impact, ATS-friendly language.
    
    Instructions:
    1. Align "Summary" with the JD.
    2. Rewrite "Description" fields in "Experience" and "Projects" to include JD keywords and action verbs.
    3. Reorder/Refine "Skills".
    4. Keep factual data (names, dates, companies) UNCHANGED.
    5. Be concise and fast.

    Resume: ${JSON.stringify(currentResume)}
    JD: ${jobDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
        temperature: 0.3,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    } else {
      throw new Error("No response generated");
    }
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    throw error;
  }
};

export const generateProfessionalSummary = async (
  currentResume: ResumeData,
  jobDescription?: string
): Promise<string> => {
  const prompt = `
    Write a professional resume summary (max 3 sentences).
    ${jobDescription ? `Context: Align with this JD:\n${jobDescription}` : ''}
    Profile: ${JSON.stringify(currentResume.personalInfo)}
    Skills: ${JSON.stringify(currentResume.skills)}
    Exp: ${JSON.stringify(currentResume.experience.slice(0, 1))}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "text/plain" }
  });

  return response.text || "";
};

export const refineSectionDescription = async (
  text: string,
  context: string,
  jobDescription?: string
): Promise<string> => {
  const prompt = `
    Rewrite the following resume bullet points to be ATS-friendly, result-oriented, and impactful.
    Context: ${context}
    ${jobDescription ? `JD Keywords to use: ${jobDescription.slice(0, 500)}...` : ''}
    Text: ${text}
    Return ONLY the refined text.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "text/plain" }
  });

  return response.text || text;
};

export const analyzeResumeKeywords = async (
  currentResume: ResumeData,
  jobDescription: string
): Promise<KeywordAnalysis> => {
  const prompt = `
    Compare Resume vs JD. Output JSON.
    Resume: ${JSON.stringify(currentResume)}
    JD: ${jobDescription}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as KeywordAnalysis;
  }
  throw new Error("Failed to analyze resume");
};

export const getResumeImprovements = async (
  currentResume: ResumeData,
  jobDescription?: string
): Promise<ReviewResult> => {
  const prompt = `
    Act as a strict Resume Auditor.
    Review the provided resume data ${jobDescription ? 'against the Job Description' : 'for general SEO and impact'}.
    
    Calculate a Score (0-100) based on ATS readiness and content quality.
    
    If the resume is excellent (score > 90), return an EMPTY 'improvements' array and a complimentary summary.
    If improvements are needed, list ONLY critical, specific, fixable issues. 
    DO NOT repeat suggestions.
    DO NOT vague suggestions like "Add more detail". Be specific with a rewritten 'suggestion' field.

    Resume Data:
    ${JSON.stringify(currentResume)}

    ${jobDescription ? `Job Description:\n${jobDescription}` : ''}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
      temperature: 0.4
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ReviewResult;
  }
  return { score: 0, summary: "Failed to analyze.", improvements: [] };
};

export const scanResumeText = async (
  resumeText: string
): Promise<ReviewResult> => {
  const prompt = `
    Act as a strict Resume Auditor.
    Review the provided raw resume text.
    
    1. Calculate a Score (0-100).
    2. Provide a 1-sentence summary of the resume's strength.
    3. List 3-5 critical improvements. Since this is raw text, 'section' might be inferred or generic.

    Resume Text:
    ${resumeText.slice(0, 10000)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: reviewSchema,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ReviewResult;
  }
  return { score: 0, summary: "Failed to scan.", improvements: [] };
};

export const parseResumeContent = async (
  text: string
): Promise<ResumeData> => {
  const prompt = `
    You are a Data Extractor.
    Extract resume data from the following unstructured text (which might be from a LinkedIn PDF export or a raw resume paste).
    Map it to the JSON schema provided.
    
    Rules:
    - Infer missing fields logically.
    - If date is just a year, assume Jan 1st.
    - Be precise with Company Names and Job Titles.
    
    Text:
    ${text.slice(0, 25000)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
      temperature: 0.1,
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text) as ResumeData;
    // Ensure arrays exist
    data.skills = data.skills || [];
    data.experience = data.experience || [];
    data.education = data.education || [];
    data.projects = data.projects || [];
    data.awards = data.awards || [];
    data.certificates = data.certificates || [];
    
    // Add IDs if missing
    data.experience.forEach(e => e.id = e.id || Math.random().toString(36).substr(2, 9));
    data.education.forEach(e => e.id = e.id || Math.random().toString(36).substr(2, 9));
    data.projects.forEach(e => e.id = e.id || Math.random().toString(36).substr(2, 9));
    data.awards.forEach(e => e.id = e.id || Math.random().toString(36).substr(2, 9));
    data.certificates.forEach(e => e.id = e.id || Math.random().toString(36).substr(2, 9));
    
    return data;
  }
  throw new Error("Failed to parse resume content");
};
