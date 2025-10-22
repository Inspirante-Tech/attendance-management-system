// components/marks/MarksDisplay.tsx
// Flexible marks display component that supports both old and new marks schema

import React from 'react';
import { StudentMarkData, TestComponent } from '@/types/student';

interface MarksDisplayProps {
    theoryMarks?: StudentMarkData[];
    labMarks?: StudentMarkData[];
    testComponents?: TestComponent[];
    // Legacy support
    legacyTheoryMarks?: {
        mse1Marks?: number;
        mse2Marks?: number;
        mse3Marks?: number;
        task1Marks?: number;
        task2Marks?: number;
        task3Marks?: number;
    };
    legacyLabMarks?: {
        recordMarks?: number;
        continuousEvaluationMarks?: number;
        labMseMarks?: number;
    };
    hasTheoryComponent?: boolean;
    hasLabComponent?: boolean;
    theoryTotal?: number;
    labTotal?: number;
}

export const MarksDisplay: React.FC<MarksDisplayProps> = ({
    theoryMarks,
    labMarks,
    testComponents,
    legacyTheoryMarks,
    legacyLabMarks,
    hasTheoryComponent,
    hasLabComponent,
    theoryTotal,
    labTotal
}) => {
    // Helper function to get mark value by test name (for backward compatibility)
    const getMarkByTestName = (testName: string, type: 'theory' | 'lab'): number | null => {
        const marks = type === 'theory' ? theoryMarks : labMarks;
        const mark = marks?.find(m => m.testName.toLowerCase().includes(testName.toLowerCase()));
        return mark?.marksObtained ?? null;
    };

    // Helper function to display a mark cell
    const renderMarkCell = (value: number | null | undefined, isApplicable: boolean = true) => {
        if (!isApplicable) {
            return <span className="text-gray-400">N/A</span>;
        }
        return <span className="font-medium">{value ?? '-'}</span>;
    };

    // Check if we're using new schema
    const isNewSchema = theoryMarks !== undefined || labMarks !== undefined;

    if (isNewSchema) {
        // New schema: Display dynamic test components
        return (
            <>
                {/* Theory marks columns */}
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('mse1', 'theory') || getMarkByTestName('mse 1', 'theory'), hasTheoryComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('mse2', 'theory') || getMarkByTestName('mse 2', 'theory'), hasTheoryComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('mse3', 'theory') || getMarkByTestName('mse 3', 'theory'), hasTheoryComponent && (theoryTotal ?? 0) < 20)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('task1', 'theory') || getMarkByTestName('task 1', 'theory'), hasTheoryComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('task2', 'theory') || getMarkByTestName('task 2', 'theory'), hasTheoryComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('task3', 'theory') || getMarkByTestName('task 3', 'theory'), hasTheoryComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {hasTheoryComponent ? (
                        <span className="font-medium text-blue-600">{theoryTotal ?? '-'}</span>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </td>

                {/* Lab marks columns */}
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('record', 'lab'), hasLabComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('ce', 'lab') || getMarkByTestName('continuous', 'lab'), hasLabComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {renderMarkCell(getMarkByTestName('lab mse', 'lab') || getMarkByTestName('mse', 'lab'), hasLabComponent)}
                </td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                    {hasLabComponent ? (
                        <span className="font-medium text-green-600">{labTotal ?? '-'}</span>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </td>
            </>
        );
    }

    // Legacy schema: Display old format
    return (
        <>
            {/* Theory marks columns */}
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.mse1Marks, hasTheoryComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.mse2Marks, hasTheoryComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.mse3Marks, hasTheoryComponent && (theoryTotal ?? 0) < 20)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.task1Marks, hasTheoryComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.task2Marks, hasTheoryComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyTheoryMarks?.task3Marks, hasTheoryComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {hasTheoryComponent ? (
                    <span className="font-medium text-blue-600">{theoryTotal ?? '-'}</span>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )}
            </td>

            {/* Lab marks columns */}
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyLabMarks?.recordMarks, hasLabComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyLabMarks?.continuousEvaluationMarks, hasLabComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {renderMarkCell(legacyLabMarks?.labMseMarks, hasLabComponent)}
            </td>
            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">
                {hasLabComponent ? (
                    <span className="font-medium text-green-600">{labTotal ?? '-'}</span>
                ) : (
                    <span className="text-gray-400">N/A</span>
                )}
            </td>
        </>
    );
};
