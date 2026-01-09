import { DrugInteraction, InteractionExplanation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface InteractionCardProps {
  interaction: DrugInteraction;
  index: number;
  interactionExplanations?: InteractionExplanation[];
}

const InteractionCard = ({ interaction, index, interactionExplanations = [] }: InteractionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const severityVariant = {
    safe: 'risk-safe',
    caution: 'risk-caution',
    danger: 'risk-danger',
  } as const;
  
  // Find matching explanation for interaction
  const matchingExplanation = interactionExplanations.find(
    exp => (exp.drug1.toLowerCase() === interaction.drug1.toLowerCase() && exp.drug2.toLowerCase() === interaction.drug2.toLowerCase()) ||
           (exp.drug1.toLowerCase() === interaction.drug2.toLowerCase() && exp.drug2.toLowerCase() === interaction.drug1.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Card variant={severityVariant[interaction.severity]}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            <span className="font-bold">{interaction.drug1}</span>
            <ArrowRight size={16} className="text-muted-foreground shrink-0" />
            <span className="font-bold">{interaction.drug2}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            {interaction.description}
          </p>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-background/50">
            <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-foreground">
              {interaction.recommendation}
            </p>
          </div>
          
          {/* Simple Language Explanation from Groq API */}
          {matchingExplanation && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Learn more
                  </>
                )}
              </button>
              
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-3"
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">What happens?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {matchingExplanation.explanation}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Potential risks:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {matchingExplanation.risks}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">What you should do:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {matchingExplanation.recommendation}
                    </p>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractionCard;
