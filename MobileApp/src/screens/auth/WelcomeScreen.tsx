import React from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    Text,
    View,
} from 'react-native';

import GradientButton from '../../components/common/GradientButton';
import BabyNutriBackground from '../../components/common/BabyNutriBackground';
import styles from '../../styles/auth/welcomeStyles';
import LinearGradient from 'react-native-linear-gradient';

function WelcomeScreen({ navigation }: any) {
    const handleContinue = () => {
        navigation.navigate('Register');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#FFF2EC', '#FFD3D8', '#F79FB2']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.container}
            >
                <BabyNutriBackground variant="welcome" />

                <View style={styles.content}>
                    <Image
                        source={require('../../assets/images/mother-baby.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>
                        Welcome to BabyNutri
                    </Text>

                    <Text style={styles.subtitle}>
                        Nurturing Healthy Growth Every Single Day
                    </Text>
                </View>

                <View style={styles.bottomSection}>
                    <GradientButton
                        title="Continue"
                        onPress={handleContinue}
                    />

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>
                            I have an account or invitation
                        </Text>

                        <Pressable onPress={handleLogin}>
                            <Text style={styles.loginLink}> Log in</Text>
                        </Pressable>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

export default WelcomeScreen;