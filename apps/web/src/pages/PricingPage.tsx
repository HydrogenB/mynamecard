import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { 
  Container, 
  Card, 
  Button, 
  Text,
  Badge 
} from '../design-system';

export default function PricingPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  
  const plans = [
    {
      id: 'free',
      badge: null,
      current: true
    },
    {
      id: 'pro',
      badge: 'Popular',
      current: false
    },
    {
      id: 'business',
      badge: null,
      current: false
    }
  ];
  
  return (
    <Container py={12}>
      <Text variant="h2" as="h1" align="center" className="mb-12">
        {t('pricing.title')}
      </Text>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            variant={plan.current ? 'elevated' : 'outline'}
            className={plan.current ? 'bg-primary-50 border border-primary-200' : ''}
            padding="lg"
          >
            {plan.badge && (
              <Badge 
                variant="primary" 
                className="absolute -top-3 right-4"
              >
                {plan.badge}
              </Badge>
            )}
            
            <Text variant="h3" as="h2" className="mb-2">
              {t(`pricing.${plan.id}.name`)}
            </Text>
            
            <Text variant="h2" as="div" className="mb-6">
              {t(`pricing.${plan.id}.price`)}
            </Text>
            
            <ul className="mb-8 space-y-3">
              {/* @ts-ignore - Dynamic key access */}
              {t(`pricing.${plan.id}.features`).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              variant={plan.current ? 'secondary' : 'primary'}
              fullWidth
              disabled={plan.current}
            >
              {t(`pricing.${plan.id}.cta`)}
            </Button>
          </Card>
        ))}
      </div>
      
      {!user && (
        <div className="text-center mt-12">
          <Button
            variant="primary"
            size="lg"
            as="link"
            to="/login"
          >
            {t('nav.login')} {t('home.cta')}
          </Button>
        </div>
      )}
    </Container>
  );
}
