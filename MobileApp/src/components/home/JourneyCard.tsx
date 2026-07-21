import React from "react";
import { View, Text } from "react-native";
import { Card, Button } from 'react-native-paper';
import styles from '../../styles/home/jouneyCardStyles';

type JourneyCardProps = {
    age: string;
    title: string;
    description: string;
    colorMonths: string;
};

function JourneyCard(
    { age,
        title,
        description,
        colorMonths, }: JourneyCardProps
) {
    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View
                    style={[
                        styles.ageCircle,
                        { backgroundColor: colorMonths },
                    ]}
                >
                    <Text style={styles.ageText}>
                        {age}
                    </Text>
                </View>

                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.description}>
                    {description}
                </Text>

                <Button
                    mode="contained"
                    style={styles.button}
                    buttonColor="#FFC62F"
                    textColor="#5B0010"
                >
                    Let&apos;s Go
                </Button>
            </Card.Content>
        </Card>
    );
}

export default JourneyCard;