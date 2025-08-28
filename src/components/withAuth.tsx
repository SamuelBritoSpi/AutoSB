// This file is no longer used for data fetching or top-level auth guarding.
// That logic has been moved to server components and layout files.
// It can be repurposed for client-side auth checks on specific components if needed in the future.
// For now, it is kept to avoid breaking imports if it was referenced somewhere else, but it's effectively inactive.

"use client";

import React from 'react';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const Wrapper = (props: P) => {
        // The core auth logic is now handled by AuthProvider and server-side checks.
        // This wrapper now simply renders the component it's given.
        return <WrappedComponent {...props} />;
    };
    
    Wrapper.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
    
    return Wrapper;
};

export default withAuth;
