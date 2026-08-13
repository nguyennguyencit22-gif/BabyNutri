import React from 'react';
import {
    Alert,
    Image,
    Pressable,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';

import ProfileHeader from '../../components/profile/ProfileHeader';
import DeleteAccountModal from '../../components/settings/DeleteAccountModal';
import { logoutFromFirebase } from '../../services/firebaseAuthService';
import { deleteMyAccount } from '../../services/auth.service';
import { logoutSucceeded } from '../../store/auth/authSlice';

import createStyles from '../../styles/settings/accountSettingStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CameraIcon = ({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <Circle cx="12" cy="13" r="4" />
    </Svg>
);

import type { RootState } from '../../store/store';

function AccountSettingsScreen({
    navigation,
}: any) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );
    const dispatch = useDispatch();

    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

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

    const handleConfirmDeleteAccount = async () => {
        setDeleting(true);
        try {
            await deleteMyAccount();

            try {
                await logoutFromFirebase();
            } catch (error) {
                console.log('Post-delete Firebase sign-out error:', error);
            }

            dispatch(logoutSucceeded());
            setDeleteModalVisible(false);

            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Welcome',
                    },
                ],
            });
        } catch (error) {
            console.log('Delete account error:', error);
            setDeleting(false);

            Alert.alert(
                'Unable to delete account',
                'Please check your connection and try again.',
            );
        }
    };

    const user = useSelector(
        (state: RootState) =>
            state.auth.user,
    );
    const isExpertOrAdmin = user?.role === 'expert' || user?.role === 'admin';

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
                        <CameraIcon
                            size={22}
                            color={colors.onPrimary}
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

            {!isExpertOrAdmin && (
                <Pressable
                    onPress={() => setDeleteModalVisible(true)}
                    style={({ pressed }) => [
                        styles.actionRow,
                        pressed &&
                        styles.actionRowPressed,
                    ]}>
                    <Text style={styles.actionText}>
                        Delete data and account
                    </Text>
                </Pressable>
            )}

            <DeleteAccountModal
                visible={deleteModalVisible}
                deleting={deleting}
                onCancel={() => setDeleteModalVisible(false)}
                onConfirm={handleConfirmDeleteAccount}
            />
        </SafeAreaView>
    );
}

export default AccountSettingsScreen;
