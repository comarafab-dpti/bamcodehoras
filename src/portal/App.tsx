import { useEffect, useState } from 'react';
import { CollaboratorLandingView } from './CollaboratorLandingView';
import { firestoreService } from '../shared/services/firestoreService';
import { storageService } from '../shared/services/storageService';
import { auth } from '../shared/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isEmployeeAuthFunctionConfigured } from '../shared/services/authService';
import { Employee, InsalubrityRecord, PaystubRecord, TimeRecord } from '../shared/types';

export default function PortalApp() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [insalubrityRecords, setInsalubrityRecords] = useState<InsalubrityRecord[]>([]);
  const [paystubs, setPaystubs] = useState<PaystubRecord[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storageService.getTheme());
  const [matricula, setMatricula] = useState<string>();

  useEffect(() => {
    if (!isEmployeeAuthFunctionConfigured()) {
      // Compatibilidade temporária exclusiva do localhost enquanto a Function não existe.
      setEmployees(storageService.getEmployees());
      setRecords(storageService.getTimeRecords());
      setInsalubrityRecords(storageService.getInsalubrityRecords());
      setPaystubs(storageService.getPaystubs());
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setMatricula(undefined);
      if (user) {
        user.getIdTokenResult().then((token) => {
          setMatricula(typeof token.claims.matricula === 'string' ? token.claims.matricula : undefined);
        });
      }
    });
    const unsubscribeEmployees = () => {};

    return () => {
      unsubscribeAuth();
      unsubscribeEmployees();
    };
  }, []);

  useEffect(() => {
    if (!isEmployeeAuthFunctionConfigured()) return;
    if (!matricula) {
      setRecords([]);
      setInsalubrityRecords([]);
      setPaystubs([]);
      return;
    }

    const unsubscribeRecords = firestoreService.subscribeTimeRecords(
      setRecords,
      (error) => console.warn('Portal: lançamentos indisponíveis', error),
      undefined,
      matricula,
    );
    const unsubscribeInsalubrity = firestoreService.subscribeInsalubrityRecords(
      setInsalubrityRecords,
      (error) => console.warn('Portal: insalubridade indisponível', error),
      { matricula },
    );
    const unsubscribePaystubs = firestoreService.subscribePaystubs(
      setPaystubs,
      (error) => console.warn('Portal: contracheques indisponíveis', error),
      undefined,
      matricula,
    );

    return () => {
      unsubscribeRecords();
      unsubscribeInsalubrity();
      unsubscribePaystubs();
    };
  }, [matricula]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storageService.setTheme(theme);
  }, [theme]);

  return (
    <CollaboratorLandingView
      employees={employees}
      records={records}
      insalubrityRecords={insalubrityRecords}
      paystubs={paystubs}
      onOpenAdminLogin={() => {
        window.location.assign('/admin.html');
      }}
      theme={theme}
      onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
    />
  );
}