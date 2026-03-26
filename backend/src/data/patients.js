const patients = [
  {
    id: "p1",
    name: "Sarah Johnson",
    phone: "+15551234567",
    missedAppointment: {
      date: "2026-03-25",
      time: "9:00 AM",
      doctor: "Dr. Patel",
      type: "General Checkup",
    },
    callStatus: "pending",
    newAppointment: null,
  },
  {
    id: "p2",
    name: "James Williams",
    phone: "+15559876543",
    missedAppointment: {
      date: "2026-03-25",
      time: "10:30 AM",
      doctor: "Dr. Chen",
      type: "Follow-up",
    },
    callStatus: "pending",
    newAppointment: null,
  },
  {
    id: "p3",
    name: "Maria Garcia",
    phone: "+15555551234",
    missedAppointment: {
      date: "2026-03-25",
      time: "2:00 PM",
      doctor: "Dr. Patel",
      type: "Annual Physical",
    },
    callStatus: "pending",
    newAppointment: null,
  },
  {
    id: "p4",
    name: "Robert Davis",
    phone: "+15555559876",
    missedAppointment: {
      date: "2026-03-24",
      time: "11:00 AM",
      doctor: "Dr. Chen",
      type: "Lab Results Review",
    },
    callStatus: "pending",
    newAppointment: null,
  },
];

module.exports = { patients };
