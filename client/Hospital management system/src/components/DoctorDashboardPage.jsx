import { useMemo, useState } from 'react';
import { updateDoctorPhoto } from '../api';

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function displayDoctorName(name) {
  return name ? `Dr. ${name.replace(/^Dr\.?\s*/i, '')}` : 'CityCare Doctor';
}

export default function DoctorDashboardPage({ user, doctors, appointments, loadData }) {
  const doctor = doctors.find((entry) => entry.id === user?.profileId)
    || doctors.find((entry) => entry.user?.email === user?.email);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [photoPreview, setPhotoPreview] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  });

  const doctorAppointments = useMemo(() => appointments.filter((appointment) => (
    appointment.doctorId === doctor?.id
    || appointment.doctor?.email === user?.email
  )), [appointments, doctor?.id, user?.email]);

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}`, day: null })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({ key: formatDateKey(year, month, index + 1), day: index + 1 })),
    ];
  }, [visibleMonth]);

  const selectedAppointments = doctorAppointments.filter((appointment) => appointment.date === selectedDate);
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(visibleMonth);
  const todayKey = formatDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const profilePhoto = photoPreview || doctor?.photo || '/images/doctor-profile-reference.png';

  const changeMonth = (offset) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Choose an image smaller than 8 MB.');
      return;
    }
    if (!doctor?.id) {
      alert('Your doctor profile could not be found.');
      return;
    }

    setSavingPhoto(true);
    try {
      const photo = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.onload = () => {
          const image = new Image();
          image.onerror = () => reject(new Error('This image could not be opened.'));
          image.onload = () => {
            const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            const context = canvas.getContext('2d');
            if (!context) {
              reject(new Error('Could not process this image.'));
              return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          };
          image.src = reader.result;
        };
        reader.readAsDataURL(file);
      });

      await updateDoctorPhoto(doctor.id, photo);
      setPhotoPreview(photo);
      await loadData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingPhoto(false);
    }
  };

  return (
    <div className="doctor-dashboard">
      <header className="doctor-dashboard-header">
        <div className="doctor-dashboard-avatar">{user?.name?.charAt(0) || 'D'}</div>
        <div><span>Good afternoon,</span><strong>{displayDoctorName(user?.name)}</strong></div>
        <span className="doctor-dashboard-role">DOCTOR PORTAL</span>
      </header>

      <div className="doctor-dashboard-columns">
        <main className="doctor-dashboard-main">
          <section className="doctor-dashboard-hero"><span>YOUR CITYCARE SCHEDULE</span><h1>Good care starts with a good day.</h1><p>Keep track of your consultations and patient visits.</p></section>

          <section className="doctor-calendar-card" aria-label="Appointment calendar">
            <div className="doctor-calendar-heading"><div><span>YOUR SCHEDULE</span><h2>Appointment calendar</h2></div><div className="doctor-calendar-month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button><strong>{monthLabel}</strong><button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button></div></div>
            <div className="doctor-calendar-grid doctor-calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((weekday) => <span key={weekday}>{weekday}</span>)}</div>
            <div className="doctor-calendar-grid">{calendarCells.map((cell) => {
              if (!cell.day) return <span className="doctor-calendar-blank" key={cell.key} />;
              const dateKey = formatDateKey(visibleMonth.getFullYear(), visibleMonth.getMonth(), cell.day);
              const hasAppointments = doctorAppointments.some((appointment) => appointment.date === dateKey);
              return <button type="button" key={cell.key} className={`doctor-calendar-day ${dateKey === selectedDate ? 'selected' : ''} ${dateKey === todayKey ? 'today' : ''} ${hasAppointments ? 'has-appointments' : ''}`} onClick={() => setSelectedDate(dateKey)} aria-label={`${dateKey}${hasAppointments ? ', appointments scheduled' : ''}`} aria-pressed={dateKey === selectedDate}><span>{cell.day}</span>{hasAppointments && <i />}</button>;
            })}</div>
            <div className="doctor-calendar-agenda"><div className="doctor-agenda-heading"><h3>{selectedDate === todayKey ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${selectedDate}T12:00:00`))}</h3><span>{selectedAppointments.length} appointments</span></div>
              {selectedAppointments.length ? <ul className="doctor-agenda-list">{selectedAppointments.map((appointment) => <li key={appointment.id}><time>{appointment.time}</time><span className="doctor-agenda-marker" /><div><strong>{appointment.patient?.name || 'Patient visit'}</strong><small>{appointment.notes || 'Consultation'}</small></div><span className={`status-badge ${appointment.status?.toLowerCase()}`}>{appointment.status}</span></li>)}</ul> : <p className="doctor-agenda-empty">No appointments scheduled for this day.</p>}
            </div>
          </section>

          <section className="doctor-upcoming-card"><div className="doctor-calendar-heading"><div><span>PATIENT CARE</span><h2>Upcoming appointments</h2></div><span className="panel-count">{doctorAppointments.length}</span></div>
            {doctorAppointments.length ? <ul className="list">{doctorAppointments.slice(0, 5).map((appointment) => <li key={appointment.id}><div><span className="list-item-title">{appointment.date} at {appointment.time}</span><p className="list-item-sub">{appointment.patient?.name || 'Patient'} · {appointment.notes || 'Consultation'}</p></div><span className={`status-badge ${appointment.status?.toLowerCase()}`}>{appointment.status}</span></li>)}</ul> : <p className="doctor-agenda-empty">Your scheduled patient visits will appear here.</p>}
          </section>
        </main>

        <aside className="doctor-profile-card">
          <div className="doctor-profile-toolbar"><span>MY PROFILE</span><button type="button" aria-label="More doctor profile options">•••</button></div>
          <div className="doctor-profile-photo"><img src={profilePhoto} alt={displayDoctorName(user?.name)} /><label className="doctor-photo-upload"><input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={savingPhoto} aria-label="Upload a new profile image" /><span aria-hidden="true">▧</span>{savingPhoto ? 'Saving…' : 'Change photo'}</label></div>
          <div className="doctor-profile-name"><h2>{displayDoctorName(user?.name)}</h2><p>{doctor?.specialization || 'CityCare Specialist'}</p></div>
          <div className="doctor-profile-details"><div><span>Availability</span><strong>{doctor?.availability || 'Contact clinic'}</strong></div><div><span>Location</span><strong>{[doctor?.localGovernment, doctor?.state].filter(Boolean).join(', ') || 'CityCare'}</strong></div><div><span>Appointments</span><strong>{doctorAppointments.length} scheduled</strong></div></div>
          <button type="button" className="primary-btn doctor-profile-action" onClick={() => document.querySelector('.doctor-calendar-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>View my calendar <span>→</span></button>
        </aside>
      </div>
    </div>
  );
}
