
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Doctor } from '@/utils/doctorUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect }) => {
  const { t } = useLanguage();
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        doctor.availability === 'available' 
          ? 'border-green-400 hover:border-green-500' 
          : 'border-orange-300 hover:border-orange-400'
      }`}
      onClick={() => onSelect(doctor)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={doctor.avatarUrl || "https://randomuser.me/api/portraits/lego/1.jpg"} 
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div 
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                doctor.availability === 'available' ? 'bg-green-500' : 'bg-orange-500'
              }`} 
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-lg">{doctor.name}</h3>
            <p className="text-gray-600 text-sm">{doctor.specialty}</p>
            
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="ml-1 text-sm">{doctor.rating}</span>
              </div>
              
              <span className="text-sm text-gray-600">
                {t('अनुभव', 'Experience')}: {doctor.experience} {t('साल', 'years')}
              </span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {doctor.languages.map(lang => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
              
              <Badge 
                className={`ml-auto ${
                  doctor.availability === 'available' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                {doctor.availability === 'available' 
                  ? t('उपलब्ध', 'Available') 
                  : t('व्यस्त', 'Busy')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
