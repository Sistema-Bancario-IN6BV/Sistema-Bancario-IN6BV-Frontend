import { DashboardContainer } from "../../shared/components/layouts/DashboardContainer";
import { Outlet } from "react-router-dom";

export const DashboardPage = () => {
    return (
        <DashboardContainer>
            <Outlet />
        </DashboardContainer>
    );
};
