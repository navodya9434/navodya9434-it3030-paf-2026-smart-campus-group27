import React from "react";
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiLayers,
  FiMapPin,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Smart Timetable Engine",
    description: "Auto-balance rooms, faculty availability, and course load with conflict-free planning.",
    icon: FiCalendar,
  },
  {
    title: "Facilities Command Center",
    description: "Track maintenance, occupancy, and assets in one live operations board.",
    icon: FiMapPin,
  },
  {
    title: "Academic Performance Insights",
    description: "Get visual trends for attendance, outcomes, and student support actions.",
    icon: FiBarChart2,
  },
  {
    title: "Security and Access Control",
    description: "Manage role-based permissions with audit logs and secure workflows.",
    icon: FiShield,
  },
  {
    title: "Student Engagement Suite",
    description: "Coordinate events, communication, and feedback loops in real time.",
    icon: FiUsers,
  },
  {
    title: "AI Recommendations",
    description: "Use predictive suggestions for staffing, scheduling, and resource planning.",
    icon: FiCpu,
  },
];

const stats = [
  { label: "Campuses Onboarded", value: "120+" },
  { label: "Daily Active Users", value: "48K" },
  { label: "Automation Workflows", value: "300+" },
  { label: "Average Response Time", value: "1.2s" },
];

const workflow = [
  {
    title: "Connect Campus Data",
    detail: "Bring attendance, facilities, and service data into one connected command layer.",
    icon: FiActivity,
  },
  {
    title: "Automate Operations",
    detail: "Create smart workflows for approvals, alerts, maintenance routing, and reports.",
    icon: FiZap,
  },
  {
    title: "Optimize Outcomes",
    detail: "Use real-time dashboards and trends to improve performance week by week.",
    icon: FiTrendingUp,
  },
];

const testimonials = [
  {
    name: "Dr. Maya Fernando",
    role: "Director of Campus Operations",
    quote:
      "CampusOpsHub helped us cut response time by nearly half while giving our teams one source of truth.",
  },
  {
    name: "Nimal Perera",
    role: "IT Service Lead",
    quote:
      "The automation layer is excellent. We now resolve recurring service issues before students even report them.",
  },
  {
    name: "Ayesha Rahman",
    role: "Academic Coordinator",
    quote:
      "Scheduling conflicts dropped dramatically. The visibility for faculty and admin is a huge win.",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(14,116,144,0.26),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_55%,#f7fbff_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                <FiLayers className="h-3.5 w-3.5" />
                Modern Campus Platform
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Build a
                <span className="block bg-linear-to-r from-cyan-700 via-sky-700 to-teal-600 bg-clip-text text-transparent">
                  Smarter Campus Experience
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
                CampusOpsHub brings academics, facilities, administration, and student services into one
                intelligent workflow. Reduce manual work, increase visibility, and move faster as one team.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Get Started
                  <FiArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">
                  <FiBookOpen className="h-4 w-4" />
                  Explore Documentation
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <FiCheckCircle className="h-4 w-4 text-cyan-700" />
                  Fast deployment
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiCheckCircle className="h-4 w-4 text-cyan-700" />
                  Enterprise-ready security
                </p>
                <p className="inline-flex items-center gap-2">
                  <FiCheckCircle className="h-4 w-4 text-cyan-700" />
                  Real-time insights
                </p>
              </div>
              <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/80 px-3 py-2 text-xs font-semibold text-cyan-800 shadow-sm">
                <FiAward className="h-4 w-4" />
                Rated #1 in usability by campus operations teams
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.15)] sm:p-7">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="text-sm font-bold text-slate-700">Operations Snapshot</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <FiClock className="h-3.5 w-3.5" />
                    Live
                  </span>
                </div>
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Classroom Utilization</span>
                      <span className="font-bold text-slate-800">89%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-[89%] rounded-full bg-cyan-600" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Service Ticket SLA</span>
                      <span className="font-bold text-slate-800">96%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className="h-2 w-[96%] rounded-full bg-teal-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-100 p-3 text-center">
                      <p className="text-xl font-black text-slate-900">24</p>
                      <p className="text-xs text-slate-500">Active Buildings</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3 text-center">
                      <p className="text-xl font-black text-slate-900">142</p>
                      <p className="text-xs text-slate-500">Events Today</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-cyan-200 bg-white px-4 py-3 shadow-lg sm:block">
                <p className="text-xs font-semibold text-cyan-700">Productivity Boost</p>
                <p className="text-lg font-black text-slate-900">+35%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <p className="text-3xl font-black text-slate-900">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">How It Works</p>
              <h2 className="mt-1 text-3xl font-black text-slate-900">Three steps to operational excellence</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-cyan-700 shadow-sm">
                    <span>0{index + 1}</span>
                  </div>
                  <div className="inline-flex rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Core Modules</p>
            <h2 className="mt-1 text-3xl font-black text-slate-900">Everything Your Campus Needs</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Testimonials</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">Loved by modern campus teams</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-1 text-amber-500">
                <FiStar className="h-4 w-4 fill-amber-400" />
                <FiStar className="h-4 w-4 fill-amber-400" />
                <FiStar className="h-4 w-4 fill-amber-400" />
                <FiStar className="h-4 w-4 fill-amber-400" />
                <FiStar className="h-4 w-4 fill-amber-400" />
              </div>
              <p className="text-sm leading-6 text-slate-600">"{item.quote}"</p>
              <p className="mt-5 font-bold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-14 text-white lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Why Teams Choose Us</p>
            <h2 className="mt-2 text-3xl font-black">Built for fast decisions and smooth operations</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Get unified visibility across classrooms, facilities, support, and administration. Stop switching tools and start running one connected ecosystem.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Ready to transform your campus?</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Start Free Access
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
