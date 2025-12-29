
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { endpoints } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  const changeLanguage = async (lng: string) => {
    if (lng === i18n.language) return;
    
    setIsTranslating(true);
    try {
      await i18n.changeLanguage(lng);
      
      toast({
        title: "Language Changed",
        description: `Switched to ${lng === 'hi' ? 'Hindi' : lng === 'es' ? 'Spanish' : 'English'}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          {isTranslating ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <Globe size={20} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('es')}>
          Español
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('hi')}>
          हिंदी (Hindi)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
