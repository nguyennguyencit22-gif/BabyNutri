import React from 'react';
import {
    Alert,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import ReanimatedSwipeable from
    'react-native-gesture-handler/ReanimatedSwipeable';

import createStyles from '../../styles/profile/babyProfileItemStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const DragHandleIcon = ({ size = 28, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Circle cx="9" cy="6" r="1.5" />
        <Circle cx="15" cy="6" r="1.5" />
        <Circle cx="9" cy="12" r="1.5" />
        <Circle cx="15" cy="12" r="1.5" />
        <Circle cx="9" cy="18" r="1.5" />
        <Circle cx="15" cy="18" r="1.5" />
    </Svg>
);

const DeleteOutlineIcon = ({ size = 26, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </Svg>
);

type BabyProfileItemProps = {
    name: string;
    ageInMonths: number;
    profileColor: string;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

function BabyProfileItem({
    name,
    ageInMonths,
    profileColor,
    onPress,
    onEdit,
    onDelete,
}: BabyProfileItemProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const handleDelete = () => {
        Alert.alert(
            'Delete baby profile',
            `Are you sure you want to delete ${name}'s profile?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDelete,
                },
            ],
        );
    };

    const renderRightActions = () => (
        <Pressable
            onPress={handleDelete}
            style={styles.deleteAction}
        >
            <DeleteOutlineIcon
                size={26}
                color={colors.onPrimary}
            />

            <Text style={styles.deleteText}>
                Delete
            </Text>
        </Pressable>
    );

    return (
        <ReanimatedSwipeable
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            renderRightActions={renderRightActions}>

            <View style={styles.container}>
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: profileColor,
                        },
                    ]}>
                    <Text style={styles.avatarText}>
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <View style={styles.info}>
                    <Text style={styles.name}>
                        {name}
                    </Text>

                    <Text style={styles.age}>
                        {ageInMonths} months old
                    </Text>
                </View>

                <Pressable
                    onPress={() => {
                        if (onEdit) {
                            onEdit();
                        } else if (onPress) {
                            onPress();
                        }
                    }}
                    style={styles.container}>
                    <DragHandleIcon
                        size={28}
                        color={colors.text}
                    />
                </Pressable>
            </View>
        </ReanimatedSwipeable>
    );
}

export default BabyProfileItem;