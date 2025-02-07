import { ReactNode } from "react";

interface NestProvidersProps {
  providers: React.JSXElementConstructor<{ children: ReactNode }>[];
  index?: number;
  children: ReactNode;
}

export const NestProviders = ({ providers, index = 0, children }: NestProvidersProps) => {
  if (index >= providers.length) return <>{children}</>; // Base case: return children

  const Provider = providers[index];

  return (
    <Provider>
      <NestProviders providers={providers} index={index + 1}>
        {children}
      </NestProviders>
    </Provider>
  );
};
