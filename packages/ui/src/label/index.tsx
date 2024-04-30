import * as LabelPrimitive from '@radix-ui/react-label';

export interface LabelProps extends LabelPrimitive.LabelProps {}

export const Label = (props: LabelProps) => {
  return <LabelPrimitive.Root {...props} />;
};
