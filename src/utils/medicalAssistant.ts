
// This is a JavaScript implementation of the Python ML model provided
// In a production app, this would be an API call to a backend service

interface DiseaseInfo {
  disease: string;
  symptoms: string[];
  description: string;
  found: boolean;
  note?: string;
}

interface Prediction {
  predictedDisease: string;
  confidence: number;
  matchingSymptoms?: string[];
  description: string;
  message: string;
}

// Medical knowledge base
const medicalKnowledge = {
  "Flu": {
    symptoms: [
      "High fever", "Body aches", "Fatigue", 
      "Respiratory symptoms", "Headache"
    ],
    description: "A contagious respiratory illness caused by influenza viruses."
  },
  "COVID-19": {
    symptoms: [
      "Fever", "Dry cough", "Tiredness", 
      "Loss of taste or smell", "Shortness of breath"
    ],
    description: "A highly infectious respiratory disease caused by the SARS-CoV-2 virus."
  },
  "Pneumonia": {
    symptoms: [
      "Chest pain", "Difficulty breathing", 
      "Persistent cough", "Fever", "Chills"
    ],
    description: "An infection that inflames the air sacs in one or both lungs."
  },
  "Diabetes": {
    symptoms: [
      "Increased thirst", "Frequent urination", 
      "Extreme hunger", "Unexplained weight loss", "Fatigue"
    ],
    description: "A chronic condition affecting how your body turns food into energy."
  },
  "Migraine": {
    symptoms: [
      "Severe headache", "Sensitivity to light", 
      "Nausea", "Vomiting", "Visual disturbances"
    ],
    description: "A neurological condition causing intense, debilitating headaches."
  },
  "Hypertension": {
    symptoms: [
      "Headaches", "Shortness of breath", 
      "Nosebleeds", "Flushing", "Dizziness"
    ],
    description: "A condition where blood pressure against artery walls is consistently too high."
  },
  "Asthma": {
    symptoms: [
      "Shortness of breath", "Chest tightness", 
      "Wheezing", "Coughing", "Difficulty breathing during physical activity"
    ],
    description: "A condition affecting airways in the lungs, causing breathing difficulties."
  }
};

// Extract all unique symptoms
const getAllSymptoms = (): string[] => {
  const allSymptoms: string[] = [];
  
  Object.values(medicalKnowledge).forEach(details => {
    details.symptoms.forEach(symptom => {
      if (!allSymptoms.includes(symptom)) {
        allSymptoms.push(symptom);
      }
    });
  });
  
  return allSymptoms;
};

export const getDiseaseSymptoms = (diseaseName: string): DiseaseInfo => {
  try {
    // Clean up disease name for case-insensitive matching
    const diseaseNameLower = diseaseName.trim().toLowerCase();
    
    // Try to find exact match
    for (const [disease, details] of Object.entries(medicalKnowledge)) {
      if (disease.toLowerCase() === diseaseNameLower) {
        return {
          disease,
          symptoms: details.symptoms,
          description: details.description,
          found: true
        };
      }
    }
    
    // Try partial matching
    for (const [disease, details] of Object.entries(medicalKnowledge)) {
      if (diseaseNameLower.includes(disease.toLowerCase()) || 
          disease.toLowerCase().includes(diseaseNameLower)) {
        return {
          disease,
          symptoms: details.symptoms,
          description: details.description,
          found: true,
          note: "Partial match found"
        };
      }
    }
    
    // Rule-based approach for common disease patterns
    if (diseaseNameLower.includes("flu") || diseaseNameLower.includes("influenza")) {
      return {
        disease: diseaseName,
        symptoms: ["Fever", "Body aches", "Fatigue", "Cough", "Headache"],
        description: "A viral respiratory infection with flu-like symptoms.",
        found: false
      };
    }
    
    // Fallback - generalized symptoms
    return {
      disease: diseaseName,
      symptoms: [
        "Pain or discomfort", 
        "Changes in normal function", 
        "Inflammation or swelling", 
        "Fatigue or weakness",
        "General feeling of unwellness"
      ],
      description: "A medical condition with generalized symptoms.",
      found: false
    };
  } catch (error) {
    console.error("Error getting disease symptoms:", error);
    return {
      disease: diseaseName,
      symptoms: ["Pain", "Discomfort", "Changes in normal function", "Inflammation", "General unwellness"],
      description: "Information based on general medical patterns",
      found: false
    };
  }
};

export const predictDiseaseFromSymptoms = (selectedSymptoms: string[]): Prediction => {
  try {
    if (!selectedSymptoms || selectedSymptoms.length === 0) {
      return {
        predictedDisease: "Unknown",
        confidence: 0,
        description: "",
        message: "Not enough symptoms to make a prediction."
      };
    }
    
    // Calculate match score for each disease
    const diseaseScores: Record<string, {
      score: number;
      matching: string[];
      description: string;
    }> = {};
    
    Object.entries(medicalKnowledge).forEach(([disease, details]) => {
      // Find matching symptoms
      const matchingSymptoms = selectedSymptoms.filter(s => 
        details.symptoms.some(known => 
          s.toLowerCase().includes(known.toLowerCase()) || 
          known.toLowerCase().includes(s.toLowerCase())
        )
      );
      
      if (matchingSymptoms.length > 0) {
        // Calculate score based on symptom matches and coverage
        const matchScore = matchingSymptoms.length / details.symptoms.length;
        const coverage = matchingSymptoms.length / selectedSymptoms.length;
        const totalScore = (matchScore + coverage) / 2;
        
        diseaseScores[disease] = {
          score: totalScore,
          matching: matchingSymptoms,
          description: details.description
        };
      }
    });
    
    // Sort diseases by score
    const sortedDiseases = Object.entries(diseaseScores)
      .sort((a, b) => b[1].score - a[1].score);
    
    if (sortedDiseases.length === 0) {
      return {
        predictedDisease: "Unknown",
        confidence: 0,
        description: "",
        message: "Could not find a matching condition. Please consult a healthcare professional."
      };
    }
    
    // Get top disease
    const [topDisease, details] = sortedDiseases[0];
    const confidence = Math.round(details.score * 100);
    
    // Format message
    let message = `Based on your symptoms, you may have ${topDisease}.\n`;
    message += `Confidence: ${confidence}%\n`;
    message += `Matching symptoms: ${details.matching.join(', ')}\n`;
    message += `\nDescription: ${details.description}\n`;
    message += "\nNote: This is not a medical diagnosis. Please consult with a healthcare professional.";
    
    return {
      predictedDisease: topDisease,
      confidence,
      matchingSymptoms: details.matching,
      description: details.description,
      message
    };
    
  } catch (error) {
    console.error("Error predicting disease:", error);
    return {
      predictedDisease: "Error",
      confidence: 0,
      description: "",
      message: "An error occurred while processing your symptoms."
    };
  }
};

export const getAllCommonSymptoms = (): string[] => {
  const allSymptoms = getAllSymptoms();
  return allSymptoms.sort(() => Math.random() - 0.5).slice(0, 15); // Return 15 random symptoms
};
