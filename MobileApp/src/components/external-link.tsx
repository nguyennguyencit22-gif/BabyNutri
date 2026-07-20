import { Linking, Pressable } from 'react-native';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  href: string;
  asChild?: boolean;
}>;

export function ExternalLink({ href, asChild, children }: Props) {
  const handlePress = async () => {
    try {
      await Linking.openURL(href);
    } catch (error) {
      console.error(`Failed to open URL: ${href}`, error);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onPress: async (event: any) => {
        if (child.props.onPress) {
          await child.props.onPress(event);
        }
        await handlePress();
      },
    });
  }

  return (
    <Pressable onPress={handlePress}>
      {children}
    </Pressable>
  );
}
