import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const SubjectsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Matérias</Text>
      <Text style={styles.subtext}>Em desenvolvimento...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fafafa',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#a3a3a3',
    fontSize: 14,
    marginTop: 8,
  },
});

export default SubjectsScreen;
