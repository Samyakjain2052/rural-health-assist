
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceGuidance from '@/components/VoiceGuidance';
import Header from '@/components/Header';

interface Symptom {
  id: string;
  hindiName: string;
  englishName: string;
  icon: string;
}

const SymptomInput: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Common symptoms
  const commonSymptoms: Symptom[] = [
    { id: 'fever', hindiName: 'बुखार', englishName: 'Fever', icon: '🌡️' },
    { id: 'cough', hindiName: 'खांसी', englishName: 'Cough', icon: '🤧' },
    { id: 'headache', hindiName: 'सिरदर्द', englishName: 'Headache', icon: '🤕' },
    { id: 'stomach-pain', hindiName: 'पेट दर्द', englishName: 'Stomach Pain', icon: '😣' },
    { id: 'weakness', hindiName: 'कमजोरी', englishName: 'Weakness', icon: '😓' },
    { id: 'none', hindiName: 'कोई नहीं', englishName: 'None', icon: '❌' },
  ];

  const toggleSymptom = (symptomId: string) => {
    if (symptomId === 'none') {
      // If "none" is selected, clear all other selections
      setSelectedSymptoms(['none']);
    } else {
      // Remove "none" if it was selected
      setSelectedSymptoms(prev => {
        const updatedSymptoms = prev.filter(id => id !== 'none');
        
        if (updatedSymptoms.includes(symptomId)) {
          // Remove symptom if already selected
          return updatedSymptoms.filter(id => id !== symptomId);
        } else {
          // Add symptom if not selected
          return [...updatedSymptoms, symptomId];
        }
      });
    }
  };

  const handleVoiceInput = () => {
    // In a real implementation, this would use speech recognition
    setIsRecording(true);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Simulate receiving symptoms from voice input
      setSelectedSymptoms(['fever', 'headache']);
      
      alert(t(
        'आवाज़ से पहचाने गए लक्षण: बुखार, सिरदर्द',
        'Symptoms recognized by voice: Fever, Headache'
      ));
    }, 3000);
  };

  const handleContinue = () => {
    if (selectedSymptoms.length === 0) {
      alert(t(
        'कृपया कम से कम एक लक्षण चुनें या "कोई नहीं" का चयन करें',
        'Please select at least one symptom or choose "None"'
      ));
      return;
    }
    
    // In a real app, you would save these symptoms to state/context
    // For this demo, we'll just navigate to the next screen
    navigate('/diagnosis');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="kiosk-large-text text-center font-hindi">
              {t('अपने लक्षण बताएँ', 'Tell us your symptoms')}
            </h1>
            <p className="text-center text-gray-600 font-hindi">
              {t('सभी लागू लक्षणों का चयन करें', 'Select all symptoms that apply')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {commonSymptoms.map(symptom => (
              <button
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-4xl">{symptom.icon}</span>
                <span className="font-hindi">
                  {language === 'hindi' ? symptom.hindiName : symptom.englishName}
                </span>
              </button>
            ))}
          </div>
          
          <div className="w-full text-center my-4">
            <p className="font-hindi text-lg mb-4">
              {t('या', 'OR')}
            </p>
            
            <button
              onClick={handleVoiceInput}
              disabled={isRecording}
              className={`kiosk-button-large mx-auto ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              <span className="font-hindi">
                {isRecording
                  ? t('रिकॉर्डिंग...', 'Recording...')
                  : t('बोलकर बताएँ', 'Speak Symptoms')
                }
              </span>
            </button>
          </div>
          
          <button 
            onClick={handleContinue}
            className="kiosk-button-large kiosk-button-green mt-4"
          >
            <span className="font-hindi">{t('आगे बढ़ें', 'Next')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          
          <VoiceGuidance
            hindiPrompt="लक्षण चुनें या माइक पर बोलें।"
            englishPrompt="Select symptoms or speak into the microphone."
          />
        </div>
      </div>
    </div>
  );
};

export default SymptomInput;
