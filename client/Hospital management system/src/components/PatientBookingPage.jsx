import { useState } from 'react';
import { createAppointment } from '../api';

function doctorDisplayName(name) {
  return name ? `Dr. ${name.replace(/^Dr\.?\s*/i, '')}` : 'CityCare Doctor';
}

export default function PatientBookingPage({ user, doctors, appointments, loadData, onLogout }) {
  const [specialty, setSpecialty] = useState('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const specialties = ['All', ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))];
  const visibleDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = specialty === 'All' || doctor.specialization === specialty;
    const searchableText = `${doctor.user?.name || ''} ${doctor.specialization || ''}`.toLowerCase();
    return matchesSpecialty && searchableText.includes(searchQuery.toLowerCase());
  });
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) || doctors[0];
  const nextAppointment = appointments[0];
  const dateOptions = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date();
    day.setDate(day.getDate() + offset);
    const value = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return { value, weekday: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day), day: day.getDate() };
  });

  const chooseDoctor = (doctor) => {
    setSelectedDoctorId(doctor.id);
    if (window.matchMedia('(max-width: 680px)').matches) {
      window.setTimeout(() => document.getElementById('appointment-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };
  const handleBooking = async (event) => {
    event.preventDefault();
    try {
      await createAppointment({ patientId: user?.profileId || '', doctorId: selectedDoctor?.id, date, time, notes });
      setDate(''); setTime(''); setNotes('');
      await loadData();
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="patient-booking-app">
      <header className="patient-app-header">
        <div className="patient-profile-badge">{user?.name?.charAt(0) || 'P'}</div>
        <div className="patient-greeting"><span>Good afternoon,</span><strong>{user?.name}</strong></div>
        <button type="button" className="patient-icon-button" aria-label="Notifications">♧</button>
        <button type="button" className="patient-icon-button" aria-label="Search doctors" onClick={() => document.getElementById('doctor-search')?.focus()}>⌕</button>
      </header>

      <div className="patient-app-columns">
        <main className="patient-home-column">
          <section className="patient-home-hero"><span>YOUR PERSONAL HEALTHCARE</span><h1>What's on your health today?</h1><p>Find trusted care that fits your life.</p></section>
          <section className="patient-next-appointment">
            <div className="patient-block-heading"><div><span>UP NEXT</span><h2>Next appointment</h2></div><span className="patient-step-dot">•••</span></div>
            {nextAppointment ? <div className="patient-next-card"><img className="patient-next-avatar" src="/images/doctor-profile-reference.png" alt="" /><div className="patient-next-info"><strong>{doctorDisplayName(nextAppointment.doctor?.name)}</strong><span>{nextAppointment.doctor?.specialization || 'General Practitioner'}</span><small>▢ &nbsp;{nextAppointment.date} &nbsp;·&nbsp; {nextAppointment.time}</small></div><span className={`status-badge ${nextAppointment.status?.toLowerCase()}`}>{nextAppointment.status}</span></div> : <div className="patient-next-empty">No appointment booked yet. Choose a doctor below to get started.</div>}
            <button type="button" className="patient-text-button" onClick={() => document.getElementById('patient-appointments')?.scrollIntoView({ behavior: 'smooth' })}>View all appointments →</button>
          </section>
          <section className="patient-find-doctor">
            <div className="patient-block-heading"><div><span>CARE YOU CAN TRUST</span><h2>Find a doctor</h2></div><span className="doctor-total">{doctors.length} available</span></div>
            <div className="patient-specialties" aria-label="Filter doctors by specialty">{specialties.map((item) => <button type="button" key={item} className={specialty === item ? 'selected' : ''} onClick={() => setSpecialty(item)}>{item}</button>)}</div>
            <div className="patient-find-heading"><h3>Available specialists</h3><span>{visibleDoctors.length} doctors</span></div>
            <input id="doctor-search" className="patient-search" aria-label="Search doctors" placeholder="Search by doctor or specialty" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            <div className="patient-doctor-list">
              {visibleDoctors.slice(0, 8).map((doctor) => <button type="button" className={`patient-doctor-card ${selectedDoctor?.id === doctor.id ? 'is-selected' : ''}`} key={doctor.id} onClick={() => chooseDoctor(doctor)}><img className="patient-list-doctor-image" src={doctor.photo || '/images/doctor-profile-reference.png'} alt="" /><span className="patient-doctor-info"><strong>{doctorDisplayName(doctor.user?.name)}</strong><small>{doctor.specialization || 'General Practitioner'}</small><small className="patient-doctor-availability">{doctor.availability || 'Appointments available'}</small></span><span className="patient-doctor-arrow" aria-hidden="true">›</span></button>)}
              {!visibleDoctors.length && <div className="patient-next-empty">No doctors in this specialty yet.</div>}
            </div>
          </section>
          <nav className="patient-bottom-nav" aria-label="Patient shortcuts"><button className="active" type="button">⌂<span>Home</span></button><button type="button" onClick={() => document.getElementById('patient-appointments')?.scrollIntoView({ behavior: 'smooth' })}>▣<span>Bookings</span></button><button type="button" onClick={() => document.getElementById('doctor-search')?.scrollIntoView({ behavior: 'smooth' })}>♡<span>Doctors</span></button><button type="button" onClick={onLogout}>⇥<span>Sign out</span></button></nav>
        </main>

        <aside className="patient-doctor-detail" id="appointment-booking">
          {selectedDoctor ? <>
            <div className="patient-detail-top"><button type="button" onClick={() => document.getElementById('doctor-search')?.scrollIntoView({ behavior: 'smooth' })}>← &nbsp; Back</button><span>⋯ &nbsp; ♡</span></div>
            <div className="patient-doctor-portrait"><img className="patient-detail-doctor-image" src={selectedDoctor.photo || '/images/doctor-profile-reference.png'} alt={doctorDisplayName(selectedDoctor.user?.name)} /></div>
            <div className="patient-detail-name"><span>DOCTOR PROFILE</span><h2>{doctorDisplayName(selectedDoctor.user?.name)}</h2><p>{selectedDoctor.specialization || 'General Practitioner'}</p></div>
            <div className="patient-doctor-facts"><div><span>Availability</span><strong>{selectedDoctor.availability || 'Ask clinic'}</strong></div><div><span>State</span><strong>{selectedDoctor.state || 'CityCare'}</strong></div><div><span>Specialty</span><strong>{selectedDoctor.specialization || 'General'}</strong></div></div>
            <form onSubmit={handleBooking} className="patient-booking-form"><h3>Select a date &amp; time</h3><span className="patient-time-label">Choose a day</span><div className="patient-date-options">{dateOptions.map((option) => <button type="button" key={option.value} className={date === option.value ? 'selected' : ''} aria-pressed={date === option.value} onClick={() => setDate(option.value)}><span>{option.weekday}</span><strong>{option.day}</strong></button>)}</div><span className="patient-time-label">Available times</span><div className="patient-time-options">{['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((slot) => <button type="button" key={slot} className={time === slot ? 'selected' : ''} aria-pressed={time === slot} onClick={() => setTime(slot)}>{slot}</button>)}</div><input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Reason for visit (optional)" aria-label="Reason for visit" /><button className="primary-btn patient-confirm-booking" type="submit" disabled={!date || !time}>Book a session <span>→</span></button></form>
          </> : <div className="patient-detail-empty"><span>+</span><h2>Choose a doctor</h2><p>Select a specialist to see their details and choose a time.</p></div>}
        </aside>
      </div>

      <section className="patient-appointments-list" id="patient-appointments"><div className="patient-block-heading"><div><span>YOUR CARE</span><h2>Your appointments</h2></div><span className="doctor-total">{appointments.length} total</span></div>{appointments.length ? <ul className="list">{appointments.slice(0, 5).map((appointment) => <li key={appointment.id}><div><span className="list-item-title">{appointment.date} at {appointment.time}</span><p className="list-item-sub">{appointment.doctor?.name || 'Doctor'} — {appointment.notes || 'Appointment'}</p></div><span className={`status-badge ${appointment.status?.toLowerCase()}`}>{appointment.status}</span></li>)}</ul> : <p className="patient-next-empty">Your booked visits will appear here.</p>}</section>
    </div>
  );
}
