        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* Header with Progress */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Interactive Islamic Wedding Guide</h2>
                  <p className="text-rose-50">Your personalized planning companion with smart recommendations</p>
                </div>
                {weddingDate && getDaysUntilWedding() && getDaysUntilWedding()! > 0 && (
                  <div className="text-right">
                    <div className="text-4xl font-bold">{getDaysUntilWedding()}</div>
                    <div className="text-rose-100">days until wedding</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${calculateGuideProgress()}%` }}
                />
              </div>
              <div className="text-sm text-rose-100 mt-2">{calculateGuideProgress()}% Complete</div>
            </div>

            {/* Smart Recommendations Dashboard */}
            {weddingDate && getDaysUntilWedding() && getCurrentPhaseRecommendation() && (
              <div className={`bg-gradient-to-r from-${getCurrentPhaseRecommendation()!.color}-100 to-${getCurrentPhaseRecommendation()!.color}-50 dark:from-${getCurrentPhaseRecommendation()!.color}-900/30 dark:to-${getCurrentPhaseRecommendation()!.color}-900/10 rounded-xl shadow-lg p-6 border-l-4 border-${getCurrentPhaseRecommendation()!.color}-600`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-${getCurrentPhaseRecommendation()!.color}-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      You Should Be Working On: {getCurrentPhaseRecommendation()!.phase}
                    </h3>
                    <div className="space-y-2">
                      {getCurrentPhaseRecommendation()!.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-gray-700 dark:text-gray-300">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                    <div className="text-2xl font-bold text-rose-600">
                      {Object.values(timelineTasks).filter(Boolean).length} / {Object.keys(timelineTasks).length || 26}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-rose-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sections Reviewed</div>
                    <div className="text-2xl font-bold text-rose-600">
                      {Object.values(reviewedSections).filter(Boolean).length} / 10
                    </div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-rose-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                    <div className="text-2xl font-bold text-rose-600">{calculateGuideProgress()}%</div>
                  </div>
                  <Award className="w-8 h-8 text-rose-600" />
                </div>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'timeline', label: 'Timeline', icon: Clock },
                  { id: 'ceremony', label: 'Ceremony', icon: Heart },
                  { id: 'tips', label: 'Tips & Best Practices', icon: Lightbulb },
                  { id: 'resources', label: 'Resources', icon: Book }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setGuideTab(id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${
                      guideTab === id
                        ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Search and Filter Bar */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search guide..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showCompleted
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {showCompleted ? 'Hide' : 'Show'} Completed
                  </button>
                </div>
              </div>

              {/* Timeline Tab */}
              {guideTab === 'timeline' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interactive Planning Timeline</h3>
                    <button
                      onClick={() => markAsReviewed('timeline')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        reviewedSections['timeline']
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {reviewedSections['timeline'] ? 'Reviewed' : 'Mark as Reviewed'}
                    </button>
                  </div>

                  {/* 6-12 Months Phase */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleTimelineSection('6-12')}
                      className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white font-bold">
                          6-12
                        </div>
                        <div className="text-left">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">6-12 Months Before</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Initial planning and major bookings</p>
                        </div>
                      </div>
                      {expandedTimeline['6-12'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedTimeline['6-12'] && (
                      <div className="p-4 space-y-2 bg-white dark:bg-gray-800">
                        {[
                          { id: 'task-1', text: 'Choose and book wedding date (avoid Ramadan and Hajj if possible)', priority: 'high' },
                          { id: 'task-2', text: 'Select and book venue (mosque, banquet hall, or outdoor space)', priority: 'high' },
                          { id: 'task-3', text: 'Find an Imam or Islamic officiant for Nikah ceremony', priority: 'high' },
                          { id: 'task-4', text: 'Discuss and finalize Mahr (dower) amount with families', priority: 'high' },
                          { id: 'task-5', text: 'Create preliminary guest list and budget', priority: 'medium' },
                          { id: 'task-6', text: 'Book photographer/videographer experienced with Islamic weddings', priority: 'medium' }
                        ].map((task) => (
                          !searchTerm || task.text.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            (!timelineTasks[task.id] || showCompleted) && (
                              <button
                                key={task.id}
                                onClick={() => toggleTimelineTask(task.id)}
                                className="flex items-start gap-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  timelineTasks[task.id]
                                    ? 'bg-rose-600 border-rose-600'
                                    : 'border-gray-300 group-hover:border-rose-400'
                                }`}>
                                  {timelineTasks[task.id] && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 text-left">
                                  <span className={`${timelineTasks[task.id] ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {task.text}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      task.priority === 'high'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                    }`}>
                                      {task.priority.toUpperCase()} PRIORITY
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3-6 Months Phase */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleTimelineSection('3-6')}
                      className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                          3-6
                        </div>
                        <div className="text-left">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">3-6 Months Before</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Attire, catering, and details</p>
                        </div>
                      </div>
                      {expandedTimeline['3-6'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    {expandedTimeline['3-6'] && (
                      <div className="p-4 space-y-2 bg-white dark:bg-gray-800">
                        {[
                          { id: 'task-7', text: 'Order wedding attire (bride\'s dress with hijab, groom\'s thobe or suit)', priority: 'high' },
                          { id: 'task-8', text: 'Arrange halal catering and menu tasting', priority: 'high' },
                          { id: 'task-9', text: 'Plan Mehndi/Henna party for bride', priority: 'medium' },
                          { id: 'task-10', text: 'Send save-the-date cards or announcements', priority: 'medium' },
                          { id: 'task-11', text: 'Book Islamic nasheeds performer or plan halal entertainment', priority: 'medium' },
                          { id: 'task-12', text: 'Prepare Nikah contract and review with families', priority: 'high' }
                        ].map((task) => (
                          !searchTerm || task.text.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            (!timelineTasks[task.id] || showCompleted) && (
                              <button
                                key={task.id}
                                onClick={() => toggleTimelineTask(task.id)}
                                className="flex items-start gap-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  timelineTasks[task.id]
                                    ? 'bg-rose-600 border-rose-600'
                                    : 'border-gray-300 group-hover:border-rose-400'
                                }`}>
                                  {timelineTasks[task.id] && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1 text-left">
                                  <span className={`${timelineTasks[task.id] ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {task.text}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      task.priority === 'high'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                    }`}>
                                      {task.priority.toUpperCase()} PRIORITY
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional timeline phases would follow the same pattern... */}
                  {/* 1-3 Months, 1-4 Weeks, Final Week */}
                </div>
              )}

              {/* Ceremony Tab with similar interactive pattern... */}
              {/* Tips Tab with collapsible sections... */}
              {/* Resources Tab with downloadable items... */}
            </div>
          </div>
        )}
