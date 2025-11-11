import React from 'react';
import {View, Text, StyleSheet, ViewStyle, TextStyle, ViewProps} from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'subject' | 'trail';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  ...props
}) => {
  return (
    <View style={[styles.card, styles[`card_${variant}`], style]} {...props}>
      {children}
    </View>
  );
};

const CardHeader: React.FC<ViewProps> = ({children, style, ...props}) => {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
};

interface CardTitleProps extends ViewProps {
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({children, style, ...props}) => {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
};

interface CardDescriptionProps extends ViewProps {
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <Text style={[styles.description, style]} {...props}>
      {children}
    </Text>
  );
};

const CardContent: React.FC<ViewProps> = ({children, style, ...props}) => {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
};

const CardFooter: React.FC<ViewProps> = ({children, style, ...props}) => {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#262626',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card_default: {
    backgroundColor: '#1a1a1a',
  },
  card_subject: {
    backgroundColor: '#1a1a1a',
    borderColor: '#3b82f6',
  },
  card_trail: {
    backgroundColor: '#1a1a1a',
    borderColor: '#f59e0b',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fafafa',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});

export {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter};
