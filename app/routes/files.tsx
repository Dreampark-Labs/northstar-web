import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/files";
import { useGlobalTerm } from "../hooks/useGlobalTerm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Files - Northstar" },
    { name: "description", content: "Manage your academic files and documents" },
  ];
}

type FilterType = "all" | "recent" | "shared" | "starred";

export default function Files() {
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { globalTermId, isFilteringByTerm } = useGlobalTerm();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const getFilterTitle = (filter: FilterType) => {
    switch (filter) {
      case "all":
        return "All Files";
      case "recent":
        return "Recent Files";
      case "shared":
        return "Shared Files";
      case "starred":
        return "Starred Files";
      default:
        return "All Files";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 max-w-none mx-auto px-4 xl:px-6 2xl:px-8">
      {/* Header */}
      <div className="flex-shrink-0 pt-1 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Files
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
              Store, organize, and access your academic documents and files.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 transform hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Folder</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 hover:shadow-md transition-all duration-200 transform hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Files</span>
            </button>
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

      {/* Files Grid - Dashboard Style with Dynamic Heights */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-3 md:gap-4 xl:gap-5 2xl:gap-6 min-h-0">
        {/* Row 1: File Stats */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Files</p>
                <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">124</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Storage Used</p>
                <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">2.4 GB</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Shared Files</p>
                <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">8</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-3 h-[19vh] md:h-[16vh] lg:h-[19vh] xl:h-[18vh] 2xl:h-[16vh]">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-1.5 xl:px-4 xl:py-2 h-full">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-caption text-gray-600 dark:text-gray-400 uppercase tracking-wide">Recent Files</p>
                <p className="text-2xl xl:text-3xl font-semibold text-gray-900 dark:text-white mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Filter Controls and File List */}
        <div className="col-span-1 md:col-span-4 lg:col-span-12 h-[45vh] md:h-[50vh] lg:h-[45vh] xl:h-[48vh] 2xl:h-[50vh]">
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
            {/* Filter Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-heading">
                  {getFilterTitle(activeFilter)}
                </h3>

                {/* Filter Tabs - Inline with Header */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      activeFilter === "all"
                        ? "text-white bg-purple-600"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveFilter("recent")}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      activeFilter === "recent"
                        ? "text-white bg-purple-600"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600"
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setActiveFilter("shared")}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      activeFilter === "shared"
                        ? "text-white bg-purple-600"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600"
                    }`}
                  >
                    Shared
                  </button>
                  <button
                    onClick={() => setActiveFilter("starred")}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      activeFilter === "starred"
                        ? "text-white bg-purple-600"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600"
                    }`}
                  >
                    Starred
                  </button>
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto scrollbar-modern min-h-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Folders Section */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Folders</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Mathematics</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">24 files</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">2 days ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Physics</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">18 files</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">1 week ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">English Literature</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15 files</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">3 days ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Files</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Physics Lab Report.pdf</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2.4 MB</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Math Assignment 3.docx</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1.2 MB</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Literature Essay Draft.pdf</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">890 KB</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">Chemistry Diagram.png</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3.1 MB</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">2 days ago</span>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
