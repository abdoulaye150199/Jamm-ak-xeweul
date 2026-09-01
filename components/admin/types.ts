export type ContributionStatus = 'Nouveau' | 'En étude' | 'En cours' | 'Résolu';
export type ContributionType = 'Besoin' | 'Idée';
export type Contribution = { id: string; memberId: string | null; title: string; author: string; neighborhood: string; type: ContributionType; status: ContributionStatus; description: string; phone: string; createdAt: string };
export type DashboardEvent = { id: string; eventDate: string | null; day: string; weekday: string; title: string; time: string; place: string; featured?: boolean; createdAt: string };
export type DashboardMember = { id: string; firstName: string; lastName: string; email: string; neighborhood: string; phone: string; createdAt: string };
export type DashboardNotification = { id: string; type: 'member' | 'event' | 'contribution'; title: string; message: string; createdAt: string; read: boolean };
