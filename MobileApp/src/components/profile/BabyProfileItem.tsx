import React from 'react';
import {
    Alert,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import ReanimatedSwipeable from
    'react-native-gesture-handler/ReanimatedSwipeable';

import createStyles from '../../styles/profile/babyProfileItemStyles';
import { useAppTheme } from '../../theme/useAppTheme';

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
            <Icon
                source="delete-outline"
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
                    onPress={onPress}
                    style={styles.container}>
                    <Icon
                        source="drag"
                        size={28}
                        color={colors.text}
                    />
                </Pressable>
            </View>
        </ReanimatedSwipeable>
    );
}

export default BabyProfileItem;