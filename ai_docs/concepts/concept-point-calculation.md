# Point Calculation System

## Overview
The point calculation system handles the logic for awarding, modifying, and tracking points in the Student Points Tracker application.

## Core Concepts

### Base Point Values
- Participation: 1-5 points
- Assignments: 5-20 points
- Behavior: -5 to +5 points
- Bonus: 1-10 points

### Multiplier System
```typescript
interface PointMultiplier {
  difficulty: number;    // 1.0 - 2.0
  effort: number;       // 1.0 - 1.5
  timeBonus: number;    // 1.0 - 1.2
  streakBonus: number;  // 1.0 - 1.3
}
```

### Calculation Rules
1. Base points are determined by activity type
2. Multipliers are applied in sequence
3. Final points are rounded to nearest integer
4. Minimum points cannot go below 0
5. Maximum points per activity is capped

## Technical Implementation

### Calculation Flow
```typescript
function calculatePoints(
  basePoints: number,
  multipliers: PointMultiplier
): number {
  let points = basePoints;
  
  // Apply multipliers
  points *= multipliers.difficulty;
  points *= multipliers.effort;
  points *= multipliers.timeBonus;
  points *= multipliers.streakBonus;
  
  // Round and cap
  points = Math.round(points);
  points = Math.max(0, Math.min(points, MAX_POINTS));
  
  return points;
}
```

### Validation Rules
- Base points must be positive
- Multipliers must be within valid ranges
- Activity type must be recognized
- Student must be eligible for points

## Related Concepts
- [Points System](./concept-points-system.md)
- [Student Roles](./concept-student-roles.md)
- [Data Validation](./arch-data-validation.md)

## AI Notes
- Consider implementing machine learning for point prediction
- Add historical performance analysis
- Implement point decay over time
- Add point bonus algorithms
- Consider adding point inflation/deflation mechanisms

## Last Updated
2024-04-01

## References
- `src/utils/pointCalculator.ts`
- `src/types/points.ts`
- `src/constants/pointRules.ts` 