
import React from 'react';

// Generic Icons
const UpdateIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg>;
const NewIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" /></svg>;
const MobileIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 .75a.75.75 0 01.75.75v1.5h.75a3 3 0 013 3v13.5a3 3 0 01-3 3h-12a3 3 0 01-3-3V6.75a3 3 0 013-3H6A.75.75 0 016.75 3zM6 6.75A1.5 1.5 0 004.5 8.25v10.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V8.25a1.5 1.5 0 00-1.5-1.5H6z" clipRule="evenodd" /></svg>;
const AddressIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.54 22.35a.75.75 0 01-1.08 0l-6.75-6.75a.75.75 0 011.08-1.08L12 21.42l7.22-7.22a.75.75 0 111.06 1.06l-7.75 7.75z" clipRule="evenodd" /><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25c0 2.263 1.22 4.257 3.03 5.333a.75.75 0 001.44 0c1.81-1.076 3.03-3.07 3.03-5.333A5.25 5.25 0 0012 1.5zM12 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>;
const StatusIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-4.794a.75.75 0 01.53.22l3.75 3.75a.75.75 0 01-1.06 1.06L12 10.06l-2.47 2.47a.75.75 0 01-1.06-1.06l3.25-3.25a.75.75 0 01.536-.22z" clipRule="evenodd" /></svg>;
const RenewIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM11.25 8.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9.75h-.75a.75.75 0 01-.75-.75zm2.03 6.28a.75.75 0 10-1.06-1.06l-1.5 1.5a.75.75 0 001.06 1.06l1.5-1.5z" clipRule="evenodd" /></svg>;
const CertificateIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 6.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V6.75zM11.25 10.5a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zM11.25 14.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01z" /><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v2.531c0 1.29.42 2.518 1.17 3.553l1.83 2.583a.75.75 0 001.2 0l1.83-2.583A5.23 5.23 0 0017.25 9.28V6.75A5.25 5.25 0 0012 1.5zm3.75 7.781a3.73 3.73 0 00-.837-2.553 3.75 3.75 0 00-5.826 0 3.73 3.73 0 00-.837 2.553V15.75h7.5V9.281z" clipRule="evenodd" /></svg>;
const DefaultIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;

// Payment Gateway Icons
const RazorpayIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
const CashIcon = (props: {className?: string}) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6V5.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.75m0 0v.75a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V6m0 0h1.5m0 0a.75.75 0 01.75.75v.75m0 0a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V7.5m-6 12a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75m9-6a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


const iconComponents: { [key: string]: React.FC<{className?: string}> } = {
    UpdateIcon, NewIcon, MobileIcon, AddressIcon, StatusIcon, RenewIcon, CertificateIcon,
    RazorpayIcon, CashIcon, DefaultIcon
};

const IconMap: React.FC<{ iconName: string; className?: string }> = ({ iconName, className }) => {
    const IconComponent = iconComponents[iconName] || DefaultIcon;
    return <IconComponent className={className} />;
};

export default IconMap;