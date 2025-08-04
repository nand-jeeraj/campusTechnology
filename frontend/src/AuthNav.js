import React, { useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import api from "./services/api";
import { AuthContext } from "./Authcontext";

// Styled Components
const AppContainer = styled.div`
  min-height: 40vh;
  background: linear-gradient(to bottom right, #f7fafc, #ebf8ff);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
`;

const Navigation = styled.nav`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;
  display: none;
`;

const NavLink = styled(Link)`
  color: #4a5568;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #2b6cb0;
    background: #ebf8ff;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #4299e1;
    transition: width 0.3s ease;
  }

  &:hover::before {
    width: 100%;
  }
`;

const ActiveNavLink = styled(NavLink)`
  color: #2b6cb0;
  font-weight: 600;

  &::before {
    width: 100%;
  }
`;

const CustomLink = ({ to, children, location }) => {
  const isActive = location.pathname === to;
  const LinkComponent = isActive ? ActiveNavLink : NavLink;
  
  return (
    <LinkComponent to={to}>
      {children}
    </LinkComponent>
  );
};

export default function AuthNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticated } = useContext(AuthContext);

  const hiddenRoutes = ["/auth/login", "/auth/register", "/auth/face-login"];
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname);

  return (
    <AppContainer>
      {!shouldHideNavbar && (
        <Navigation>
          <CustomLink to="/auth" location={location}>Options</CustomLink>
          <CustomLink to="/auth/login-options" location={location}>Login Options</CustomLink>
        </Navigation>
      )}
      <Outlet />
    </AppContainer>
  );
}