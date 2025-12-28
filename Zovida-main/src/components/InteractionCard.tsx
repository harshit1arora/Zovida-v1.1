import { DrugInteraction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractionCardProps {
  interaction: DrugInteraction;
  index: number;
}

const InteractionCard = ({ interaction, index }: InteractionCardProps) => {
  const severityVariant = {
    safe: 'risk-safe',
    caution: 'risk-caution',
    danger: 'risk-danger',
  } as const;

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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractionCard;
