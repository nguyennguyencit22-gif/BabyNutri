import React from 'react';
import {
    Button,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

function HomeScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>BabyNutri Home</Text>

                <Button
                    title="Open Profile"
                    onPress={() => navigation.navigate('Profile')}
                />

                <View style={styles.divider} />
                <Text style={{fontWeight: 'bold', color: 'red'}}>Member C Features:</Text>
                
                <Button
                    title="Child Profile"
                    color="#f4511e"
                    onPress={() => navigation.navigate('ChildList')}
                />
                
                <Button
                    title="Meal Plans"
                    color="#f4511e"
                    onPress={() => navigation.navigate('MealPlanList')}
                />

                <Button
                    title="FAQ"
                    color="#f4511e"
                    onPress={() => navigation.navigate('FAQ')}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        width: '80%',
        backgroundColor: '#ccc',
        marginVertical: 10,
    }
});

export default HomeScreen;