import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import createStyles from '../../styles/profile/deleteBabyProfileModalStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CheckIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

type DeleteBabyProfileModalProps = {
    visible: boolean;
    babyName: string;
    recordCount?: number;
    onCancel: () => void;
    onConfirm: () => void;
};

function DeleteBabyProfileModal({
    visible,
    babyName,
    recordCount = 0,
    onCancel,
    onConfirm,
}: DeleteBabyProfileModalProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const [isConfirmed, setIsConfirmed] =
        React.useState(false);

    React.useEffect(() => {
        if (!visible) {
            setIsConfirmed(false);
        }
    }, [visible]);

    const handleConfirm = () => {
        if (!isConfirmed) {
            return;
        }

        onConfirm();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}>

            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onCancel}
                />

                <View style={styles.modalCard}>
                    <Text style={styles.warningTitle}>
                        Warning
                    </Text>

                    <Text style={styles.mainMessage}>
                        Delete {babyName}’s profile? This will also
                        delete all records for this profile!
                    </Text>

                    <Text style={styles.recordText}>
                        Number of records: {recordCount}
                    </Text>

                    <Text style={styles.description}>
                        This action cannot be undone. Please confirm
                        with a checkbox.
                    </Text>

                    <Pressable
                        onPress={() =>
                            setIsConfirmed(previous => !previous)
                        }
                        style={styles.confirmRow}>

                        <View
                            style={[
                                styles.checkbox,
                                isConfirmed &&
                                styles.checkboxSelected,
                            ]}>
                            {isConfirmed ? (
                                <CheckIcon
                                    size={16}
                                    color={colors.onPrimary}
                                />
                            ) : null}
                        </View>

                        <Text style={styles.confirmText}>
                            I understand
                        </Text>
                    </Pressable>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={onCancel}
                            style={styles.actionButton}>
                            <Text style={styles.cancelText}>
                                Cancel
                            </Text>
                        </Pressable>

                        <Pressable
                            disabled={!isConfirmed}
                            onPress={handleConfirm}
                            style={styles.actionButton}>
                            <Text
                                style={[
                                    styles.deleteText,
                                    !isConfirmed &&
                                    styles.deleteTextDisabled,
                                ]}>
                                Delete
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default DeleteBabyProfileModal;