import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Check, ChevronRight, ChevronLeft, CheckCircle2, ChevronDown } from 'lucide-react';

interface BookPageProps {
  preselectedServiceId?: string;
  onNavigate: (section: string) => void;
  onOpenSearch?: () => void;
}

export const BookPage: React.FC<BookPageProps> = ({ preselectedServiceId, onNavigate, onOpenSearch }) => {
  const { services, faqs, submitBooking } = useData();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceId, setServiceId] = useState(preselectedServiceId || '');
  const [serviceName, setServiceName] = useState('');
  const [dateType, setDateType] = useState<'single' | 'range'>('single');
  const [dateValue, setDateValue] = useState('');
  const [endDateValue, setEndDateValue] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formError, setFormError] = useState('');

  // FAQ accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs.length > 0 ? faqs[0].id : null);

  useEffect(() => {
    if (preselectedServiceId) {
      setServiceId(preselectedServiceId);
      const s = services.find(srv => srv.id === preselectedServiceId);
      if (s) setServiceName(s.title);
    }
  }, [preselectedServiceId, services]);

  const handleSelectService = (id: string, name: string) => {
    setServiceId(id);
    setServiceName(name);
    setFormError('');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!serviceName) {
        setFormError('Please select a production discipline.');
        return;
      }
    } else if (currentStep === 2) {
      if (!dateValue) {
        setFormError('Please choose your preferred production date.');
        return;
      }
      if (dateType === 'range' && !endDateValue) {
        setFormError('Please specify an estimated wrap date.');
        return;
      }
    } else if (currentStep === 3) {
      if (!projectDescription || projectDescription.trim().length < 10) {
        setFormError('Please provide a brief description of your creative vision (minimum 10 characters).');
        return;
      }
    }
    setFormError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setFormError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !phone) {
      setFormError('Please complete your name, email, and telephone number.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const res = await submitBooking({
      clientName,
      email,
      phone,
      serviceId,
      serviceName,
      dateType,
      dateValue,
      endDateValue: dateType === 'range' ? endDateValue : undefined,
      projectDescription
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsConfirmed(true);
    } else {
      setFormError(res.error || 'Unable to submit booking. Please check connection.');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setServiceId('');
    setServiceName('');
    setDateType('single');
    setDateValue('');
    setEndDateValue('');
    setProjectDescription('');
    setClientName('');
    setEmail('');
    setPhone('');
    setIsConfirmed(false);
  };

  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);

  return (
    <div id="book-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Production Booking
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-4">
          Reserve Production
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          Reserve a window in our production schedule. Following your brief, our team will connect directly to confirm creative treatment and logistical requirements.
        </p>
      </div>

      {/* Booking Form */}
      <div className="pb-20 border-b border-[var(--border-color)] mb-20">
        {isConfirmed ? (
          /* Elegant Confirmation View */
          <div id="booking-confirmation-view" className="py-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl border border-[var(--color-gold)]/60 bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--color-gold)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] mb-3">
              Reservation Received
            </h2>
            <p className="text-base text-[var(--text-body)]/80 font-normal leading-relaxed mb-6">
              Thank you, <span className="text-[var(--text-heading)] font-semibold">{clientName}</span>. Your reservation for <span className="text-[var(--color-gold)] font-semibold">{serviceName}</span> has been logged.
            </p>
            <div className="py-4 border-y border-[var(--border-color)] text-left text-xs space-y-2 text-[var(--text-body)]/80 mb-8">
              <div><strong className="text-[var(--text-heading)]">Date:</strong> {dateValue} {dateType === 'range' && endDateValue ? `to ${endDateValue}` : ''}</div>
              <div><strong className="text-[var(--text-heading)]">Contact:</strong> {email} / {phone}</div>
              <div><strong className="text-[var(--text-heading)]">Status:</strong> Confirmed into schedule review</div>
            </div>
            <button
              onClick={resetForm}
              className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] hover:underline transition-colors cursor-pointer"
            >
              ← Schedule Another Commission
            </button>
          </div>
        ) : (
          <div>
            {/* Minimal Step Indicator */}
            <div className="mb-10 pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs mb-3 font-semibold">
                <span className="text-[var(--color-gold)] uppercase tracking-wider">
                  Step {currentStep} of 4
                </span>
                <span className="text-[var(--text-body)]/70">
                  {currentStep === 1 && 'Select Service'}
                  {currentStep === 2 && 'Schedule Dates'}
                  {currentStep === 3 && 'Project Scope'}
                  {currentStep === 4 && 'Contact Details'}
                </span>
              </div>
              <div className="w-full h-[2px] bg-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-gold)] transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-6 p-3 bg-red-950/40 border border-red-800/40 rounded-xs text-xs text-red-300">
                {formError}
              </div>
            )}

            {/* STEP 1: Select Discipline */}
            {currentStep === 1 && (
              <div id="booking-step-1" className="space-y-6">
                <div>
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)]">
                      Select Production Discipline
                    </h3>
                    <span className="text-xs font-mono text-[var(--color-gold)] tracking-wide">
                      Click any option below to choose
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-body)]/75 font-normal">
                    Choose the creative discipline that fits your project, or select Bespoke Commission for custom cinematic production.
                  </p>
                </div>

                {/* Clear, Clickable Interactive Service Cards */}
                <div className="space-y-3 pt-2">
                  {services.map((srv) => {
                    const isSelected = serviceId === srv.id;
                    return (
                      <div
                        key={srv.id}
                        role="button"
                        tabIndex={0}
                        id={`service-card-${srv.id}`}
                        onClick={() => handleSelectService(srv.id, srv.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectService(srv.id, srv.title);
                          }
                        }}
                        className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                          isSelected
                            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 ring-1 ring-[var(--color-gold)] shadow-sm'
                            : 'border-[var(--border-color)] bg-[var(--bg-color)]/50 hover:border-[var(--color-gold)]/60 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <span className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                              isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--text-heading)]'
                            }`}>
                              {srv.title}
                            </span>
                            {srv.priceRange && (
                              <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 text-[var(--text-body)]/70">
                                {srv.priceRange}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-body)]/80 font-normal leading-relaxed max-w-xl">
                            {srv.shortDescription}
                          </p>
                        </div>

                        {/* Unmistakable Selection Status Pill */}
                        <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]/60">
                          {isSelected ? (
                            <span className="px-3.5 py-1.5 rounded-lg bg-[var(--color-gold)] text-[#192c45] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]/75 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
                              Click to Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Bespoke Option Card */}
                  {(() => {
                    const isSelected = serviceId === 'custom';
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        id="service-card-custom"
                        onClick={() => handleSelectService('custom', 'Custom Bespoke Production')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectService('custom', 'Custom Bespoke Production');
                          }
                        }}
                        className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                          isSelected
                            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 ring-1 ring-[var(--color-gold)] shadow-sm'
                            : 'border-[var(--border-color)] bg-[var(--bg-color)]/50 hover:border-[var(--color-gold)]/60 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                            <span className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                              isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--text-heading)]'
                            }`}>
                              Bespoke Commission
                            </span>
                            <span className="text-[11px] font-mono tracking-wider px-2 py-0.5 rounded-sm bg-black/5 dark:bg-white/5 text-[var(--text-body)]/70">
                              Custom Scope
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-body)]/80 font-normal leading-relaxed max-w-xl">
                            Tailored cross-disciplinary production scoped directly to your brief and technical demands.
                          </p>
                        </div>

                        <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]/60">
                          {isSelected ? (
                            <span className="px-3.5 py-1.5 rounded-lg bg-[var(--color-gold)] text-[#192c45] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold uppercase tracking-wider text-[var(--text-body)]/75 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors">
                              Click to Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Selected Confirmation Banner */}
                {serviceName && (
                  <div className="p-3.5 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/40 flex items-center justify-between text-xs text-[var(--text-heading)]">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--color-gold)] stroke-[2.5]" />
                      <span>Ready to proceed with <strong className="text-[var(--color-gold)]">{serviceName}</strong></span>
                    </span>
                    <span className="text-[var(--text-body)]/70 text-[11px] hidden sm:inline">Click 'Continue to Dates' below</span>
                  </div>
                )}

                <div className="pt-6 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-body)]/60">
                    {serviceName ? `Selected: ${serviceName}` : 'Please select a service above'}
                  </span>
                  <button
                    id="step-1-next-btn"
                    onClick={handleNext}
                    className={`px-6 py-3 font-semibold text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                      serviceName
                        ? 'bg-[var(--color-gold)] text-[#192c45] hover:brightness-105'
                        : 'bg-[var(--border-color)] text-[var(--text-body)]/60 hover:bg-[var(--border-color)]/80'
                    }`}
                  >
                    <span>Continue to Dates</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Date Selection */}
            {currentStep === 2 && (
              <div id="booking-step-2" className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
                    Production Timeline
                  </h3>
                  <p className="text-sm text-[var(--text-body)]/75 font-normal">
                    Specify whether your shoot is a single day or a multi-day range.
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setDateType('single')}
                    className={`px-4 py-2 text-xs tracking-wider uppercase rounded-sm border cursor-pointer transition-colors ${
                      dateType === 'single'
                        ? 'bg-[var(--color-gold)] text-[#192c45] border-[var(--color-gold)] font-semibold'
                        : 'border-[var(--border-color)] text-[var(--text-body)]/80 hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    Single Shoot Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType('range')}
                    className={`px-4 py-2 text-xs tracking-wider uppercase rounded-sm border cursor-pointer transition-colors ${
                      dateType === 'range'
                        ? 'bg-[var(--color-gold)] text-[#192c45] border-[var(--color-gold)] font-semibold'
                        : 'border-[var(--border-color)] text-[var(--text-body)]/80 hover:border-[var(--color-gold)]/50'
                    }`}
                  >
                    Date Window
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                      {dateType === 'range' ? 'Target Start Date' : 'Shoot Date'}
                    </label>
                    <input
                      type="date"
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>

                  {dateType === 'range' && (
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                        Target Wrap Date
                      </label>
                      <input
                        type="date"
                        value={endDateValue}
                        min={dateValue}
                        onChange={(e) => setEndDateValue(e.target.value)}
                        className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-8 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/80 hover:text-[var(--text-heading)] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    id="step-2-next-btn"
                    onClick={handleNext}
                    className="px-6 py-3 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span>Continue to Brief</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Brief */}
            {currentStep === 3 && (
              <div id="booking-step-3" className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
                    Creative Scope & Treatment
                  </h3>
                  <p className="text-sm text-[var(--text-body)]/75 font-normal">
                    Summarize your vision, intended tone, and deliverables.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your concept, schedule requirements, locations, or deliverables..."
                    className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none resize-y"
                  />
                </div>

                <div className="pt-8 flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/80 hover:text-[var(--text-heading)] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    id="step-3-next-btn"
                    onClick={handleNext}
                    className="px-6 py-3 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <span>Continue to Contact</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Contact Details */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmit} id="booking-step-4" className="space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
                    Producer & Client Contact
                  </h3>
                  <p className="text-sm text-[var(--text-body)]/75 font-normal">
                    Provide your details for direct coordination.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                      Client / Producer Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (323) 555-0198"
                      className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                    />
                  </div>
                </div>

                <div className="py-4 border-y border-[var(--border-color)] text-xs text-[var(--text-body)]/80 space-y-1">
                  <div><strong>Selected Service:</strong> {serviceName}</div>
                  <div><strong>Dates:</strong> {dateValue} {dateType === 'range' && endDateValue ? `to ${endDateValue}` : ''}</div>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/80 hover:text-[var(--text-heading)] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    id="submit-booking-final-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSubmitting ? 'Submitting Reservation...' : 'Reserve Production Window'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* FAQ Accordion Section */}
      <div id="booking-faq-section" className="pt-4">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">
            Questions & Answers
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)]">
            Production Inquiries
          </h2>
        </div>

        <div className="divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
          {sortedFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} id={`faq-item-${faq.id}`} className="py-5">
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between gap-4 cursor-pointer group"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-gold)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-4 text-sm text-[var(--text-body)]/85 font-normal leading-relaxed max-w-3xl">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
