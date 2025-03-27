
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceGuidance from '@/components/VoiceGuidance';
import Header from '@/components/Header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { predictDiseaseFromSymptoms, getAllCommonSymptoms } from '@/utils/medicalAssistant';

const Diagnosis: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get symptoms from location state
  const symptoms = location.state?.symptoms || [];
  const noneSelected = location.state?.noneSelected || false;
  
  const [prediction, setPrediction] = useState<{
    disease: string;
    confidence: number;
    description: string;
    matchingSymptoms?: string[];
  } | null>(null);

  // Use the ML model to predict the disease based on symptoms
  useEffect(() => {
    if (symptoms.length > 0) {
      // This simulates the prediction from the ML model
      // In a real app, this would be an API call to your ML service
      setTimeout(() => {
        const predictionResult = predictDiseaseFromSymptoms(symptoms);
        
        setPrediction({
          disease: t(predictionResult.predictedDisease, predictionResult.predictedDisease),
          confidence: predictionResult.confidence,
          description: t(predictionResult.description, predictionResult.description),
          matchingSymptoms: predictionResult.matchingSymptoms
        });
      }, 1000);
    } else if (noneSelected) {
      // If "None of the above" was selected but no symptoms were provided,
      // we display a message about insufficient information
      setPrediction({
        disease: t('अनिश्चित', 'Uncertain'),
        confidence: 0,
        description: t(
          'पर्याप्त लक्षण जानकारी प्रदान नहीं की गई है। कृपया अधिक विवरण प्रदान करें या स्वास्थ्य पेशेवर से परामर्श करें।',
          'Not enough symptom information provided. Please provide more details or consult a healthcare professional.'
        )
      });
    }
  }, [t, symptoms, noneSelected]);

  const handleCallDoctor = () => {
    navigate('/doctor-call');
  };

  const handleHomeRemedies = () => {
    alert(t(
      'घरेलू उपाय: पर्याप्त आराम करें, पानी पियें, और सिर पर ठंडा कपड़ा रखें।',
      'Home remedies: Get plenty of rest, drink water, and apply a cold compress to your head.'
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
            </div>
            
            <h1 className="kiosk-large-text text-center font-hindi">
              {t('आपके लक्षण', 'Your Symptoms')}
            </h1>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl w-full">
            {symptoms.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {symptoms.map((symptom: string, index: number) => (
                  <li key={index} className="text-xl font-hindi">{symptom}</li>
                ))}
              </ul>
            ) : noneSelected ? (
              <p className="text-xl text-center font-hindi text-orange-600">
                {t(
                  'आपने "कोई नहीं" का चयन किया है, लेकिन कोई अन्य लक्षण नहीं चुना।',
                  'You selected "None", but didn\'t choose any other symptoms.'
                )}
              </p>
            ) : (
              <p className="text-xl text-center font-hindi">
                {t('कोई लक्षण नहीं चुना गया', 'No symptoms selected')}
              </p>
            )}
          </div>
          
          {prediction && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center font-hindi">
                  {t('संभावित निदान', 'Possible Diagnosis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-hindi">{prediction.disease}</span>
                    <span className={`text-lg font-medium px-2 py-1 rounded ${
                      prediction.confidence > 70 
                        ? 'bg-green-100 text-green-800' 
                        : prediction.confidence > 40 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {prediction.confidence}% {t('संभावना', 'Confidence')}
                    </span>
                  </div>
                  
                  {prediction.matchingSymptoms && prediction.matchingSymptoms.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h3 className="font-medium mb-2 font-hindi">
                        {t('मेल खाते लक्षण:', 'Matching Symptoms:')}
                      </h3>
                      <ul className="list-disc list-inside">
                        {prediction.matchingSymptoms.map((symptom, index) => (
                          <li key={index} className="font-hindi">{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Alert>
                    <AlertTitle>{t('विवरण', 'Description')}</AlertTitle>
                    <AlertDescription className="font-hindi">
                      {prediction.description}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert variant="destructive">
                    <AlertDescription className="font-hindi">
                      {t(
                        'यह एक चिकित्सा निदान नहीं है। कृपया सही निदान के लिए स्वास्थ्य पेशेवर से परामर्श करें।',
                        'This is not a medical diagnosis. Please consult a healthcare professional for proper diagnosis.'
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
          
          <h2 className="kiosk-medium-text text-center font-hindi mt-4">
            {t('क्या करें?', 'What to do?')}
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full">
            <button 
              onClick={handleCallDoctor}
              className="kiosk-button-large kiosk-button-red flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="font-hindi">{t('डॉक्टर से बात करें', 'Call Doctor')}</span>
            </button>
            
            <button 
              onClick={handleHomeRemedies}
              className="kiosk-button-large kiosk-button-green flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="font-hindi">{t('घरेलू उपाय देखें', 'Home Remedies')}</span>
            </button>
          </div>
          
          <VoiceGuidance
            hindiPrompt="डॉक्टर से बात करने के लिए लाल बटन दबाएँ।"
            englishPrompt="Press the red button to talk to a doctor."
          />
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;
