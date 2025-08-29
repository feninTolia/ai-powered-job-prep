import BackLink from '@/components/BackLink';

type Props = {};

const JobInfosPage = (props: Props) => {
  return (
    <div className="container">
      <BackLink href="/app">Dashboard</BackLink>
      <h1 className="text-2xl">Job Infos Page</h1>
    </div>
  );
};

export default JobInfosPage;
