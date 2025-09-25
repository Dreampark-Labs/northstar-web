import type { Route } from "./+types/grades";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router";
import { useGlobalTerm } from "../hooks/useGlobalTerm";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Grades - Northstar" },
    { name: "description", content: "Track your academic grades and performance" },
  ];
}

export default function Grades() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { globalTermId, isFilteringByTerm } = useGlobalTerm();
  
  // Get data from Convex
  const userStats = useQuery(api.grades.getUserStats);
  const userTerms = useQuery(api.grades.getUserTerms);
  
  // Get active term from URL params or use the most recent term
  const urlTermId = searchParams.get("termId");
  const activeTerm = userTerms?.find(term => term._id === urlTermId) || 
                    (userTerms && userTerms.length > 0 ? userTerms[0] : null);
  
  // Use globalTermId if filtering by term, otherwise use activeTerm
  const selectedTermId = isFilteringByTerm ? globalTermId as Id<"terms"> : activeTerm?._id;
  
  // Get course grades for the selected term
  const courseGrades = useQuery(api.grades.getCourseGrades, 
    selectedTermId ? { termId: selectedTermId } : {}
  );
  
  // Function to update term and URL
  const setActiveTermById = (termId: Id<"terms">) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (userTerms && userTerms[0]?._id === termId) {
      // Remove term param when showing most recent term
      newSearchParams.delete("termId");
    } else {
      newSearchParams.set("termId", termId);
    }
    setSearchParams(newSearchParams);
  };
  
  // Loading state
  if (userStats === undefined || userTerms === undefined || courseGrades === undefined) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 max-w-none mx-auto px-4 xl:px-6 2xl:px-8">
        {/* Header */}
        <div className="flex-shrink-0 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Grades
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
                Monitor your academic performance and track your progress.
              </p>
            </div>
          </div>
        </div>

        {/* Global Term Filter Indicator */}
        {isFilteringByTerm && (
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 border border-purple-200 dark:border-purple-700 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Filtering by specific term (ID: {globalTermId})
              </span>
            </div>
            <button 
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete("globalTerm");
                setSearchParams(newSearchParams);
              }}
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium"
            >
              Show All Terms
            </button>
          </div>
        )}

        {/* Grade Grid - Dashboard Style with Dynamic Heights */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-3 md:gap-4 xl:gap-5 2xl:gap-6">
          {/* Row 1: Grade Stats */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Current GPA</p>
                  <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                    {userStats.gpa ? userStats.gpa.toFixed(2) : "0.00"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedTermId ? `Term: ${activeTerm?.name}` : "Overall GPA"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Credits Completed</p>
                  <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                    {userStats.totalCredits || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {courseGrades?.reduce((sum, course) => sum + course.creditHours, 0) || 0} this term
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Courses</p>
                  <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                    {courseGrades?.length || 0}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {selectedTermId ? "This term" : "All terms"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Term Selector and Grades Table */}
          <div className="col-span-1 md:col-span-4 lg:col-span-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              {/* Filter Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-heading">
                    Course Grades
                  </h3>

                  {/* Term Filter Tabs - Dynamic from Database */}
                  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-full max-w-full overflow-x-auto">
                    {userTerms && userTerms.length > 0 ? (
                      userTerms.slice(0, 5).map((term) => (
                        <button
                          key={term._id}
                          onClick={() => setActiveTermById(term._id)}
                          className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                            activeTerm?._id === term._id
                              ? "text-white bg-purple-600"
                              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600"
                          }`}
                        >
                          {term.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No terms found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grade Points
                      </th>
                    </tr>
                  </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {courseGrades && courseGrades.length > 0 ? (
                  courseGrades.map((course) => {
                    // Function to get grade color based on letter grade
                    const getGradeColor = (letterGrade: string) => {
                      if (letterGrade.startsWith('A')) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                      if (letterGrade.startsWith('B')) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                      if (letterGrade.startsWith('C')) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
                      if (letterGrade.startsWith('D')) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
                      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
                    };

                    return (
                      <tr key={course._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {course.creditHours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(course.letterGrade)}`}>
                            {course.letterGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {course.averageGrade.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {course.gradePoints.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No courses found</p>
                        <p className="text-sm mt-1">
                          {selectedTermId 
                            ? `No courses found for ${activeTerm?.name || 'the selected term'}` 
                            : "No courses found in your account"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {courseGrades && courseGrades.length > 0 && (
                <tfoot className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Term Totals
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {courseGrades.reduce((sum, course) => sum + course.creditHours, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {courseGrades.length > 0 
                        ? `GPA: ${(courseGrades.reduce((sum, course) => sum + course.gradePoints, 0) / 
                            courseGrades.reduce((sum, course) => sum + course.creditHours, 0)).toFixed(2)}`
                        : "GPA: 0.00"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {courseGrades.length > 0 
                        ? `Avg: ${(courseGrades.reduce((sum, course) => sum + course.averageGrade, 0) / courseGrades.length).toFixed(1)}%`
                        : "Avg: 0%"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {courseGrades.reduce((sum, course) => sum + course.gradePoints, 0).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              )}
                </table>
              </div>
            </div>
          </div>

          {/* Row 3: Grade Trends */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GPA Trend</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fall 2023</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">3.45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spring 2024</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">3.55</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fall 2024</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">3.67</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">A grades</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">40%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">B grades</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">C grades</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
