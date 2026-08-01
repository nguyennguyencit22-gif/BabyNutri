import React from 'react';
import {
    Alert,
    Image,
    Pressable,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Icon,
    Text,
} from 'react-native-paper';
import { useSelector } from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import {
    logoutFromFirebase,
} from '../../services/firebaseAuthService';

import styles from '@/styles/settings/accountSettingStyles';

import type { RootState } from '../../store/Store';

function AccountSettingsScreen({
    navigation,
}: any) {
    const handleChangePhoto = () => {
        console.log('Open profile photo picker');
    };

    const handleLogout = () => {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logoutFromFirebase();

                            navigation.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: 'Welcome',
                                    },
                                ],
                            });
                        } catch (error) {
                            console.log(
                                'Logout error:',
                                error,
                            );

                            Alert.alert(
                                'Logout failed',
                                'Please try again.',
                            );
                        }
                    },
                },
            ],
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete data and account',
            'This action will permanently delete your account and data. Are you sure?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        console.log(
                            'Delete account API',
                        );
                    },
                },
            ],
        );
    };

    const user = useSelector(
        (state: RootState) =>
            state.auth.user,
    );

    const email = user?.email || 'No email';

    const photoURL = user?.photoURL;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title="Account settings"
                onBack={() =>
                    navigation.goBack()
                }
            />

            <View style={styles.profileCard}>
                <View style={styles.avatarWrapper}>
                    {photoURL ? (
                        <Image
                            source={{ uri: photoURL }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarLetter}>
                                {email
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleChangePhoto}
                        style={styles.cameraButton}>
                        <Icon
                            source="camera"
                            size={22}
                            color="#FFFFFF"
                        />
                    </Pressable>
                </View>
                <Text
                    numberOfLines={1}
                    style={styles.email}>
                    {email}
                </Text>
            </View>

            <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                    styles.actionRow,
                    pressed &&
                    styles.actionRowPressed,
                ]}>
                <Text style={styles.actionText}>
                    Log out
                </Text>
            </Pressable>

            <Pressable
                onPress={handleDeleteAccount}
                style={({ pressed }) => [
                    styles.actionRow,
                    pressed &&
                    styles.actionRowPressed,
                ]}>
                <Text style={styles.actionText}>
                    Delete data and account
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}

export default AccountSettingsScreen;

