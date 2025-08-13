import { getParams } from "./utils/getParams";
import { initScheduler } from './scheduler';


const app = async () => {

  const params = getParams() as { token?: string; [key: string]: any };
  const token = typeof params?.token === 'string'
  ? params.token
  : 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1FVTNSRVk1Tmprek9UVTFRVVl3T1VJd01rTkZNVFkyTkRReE1UUXpOekZDTXpZMFEwUkVSQSJ9.eyJodHRwczovL2NsYWltcy5pYmlzYS5jby9ncm91cCI6WyJwb3dlcnVzZXIiXSwiaHR0cHM6Ly9jbGFpbXMuaWJpc2EuY28vdGVuYW50IjpbIkludGVybmV4YSJdLCJodHRwczovL2NsYWltcy5pYmlzYS5jby90ZW5hbnRBZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9pYmlzYS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjdmZDQ1M2RiZDViZDY1MGUwODA2N2U1IiwiYXVkIjpbImh0dHBzOi8vaWJpc2EuY28vYXBpIiwiaHR0cHM6Ly9pYmlzYS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzU1MDk2NjYyLCJleHAiOjE3NTc2ODg2NjIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDp1c2VycyBkZWZhdWx0IiwiZ3R5IjoicGFzc3dvcmQiLCJhenAiOiJlRmJwRTRIdDQwcUVtQ1ZJM0lOOThmeHgxakU4bzBGZCJ9.OyhOQt8amRIgC_8vFjB1CsszBaFvX8XJGVFxUmNM9sgaUJrIkF2hxHib9alQUe7DjVsn55aAXPeSQVSJ5lh1NShK3vEWImdPMOcuH6bxSFqY2s11c_19RQRc9C_3Gs5ECKEEthg1H-j5BLTbFVlVvzGC-xY98F_jJtQ2DZ0GBvFKXIK_EOa1Uec32OpbX0iiNGqlUdntK6A0OPnKGBiuqcdSFk4ofodfBpzZTa5Agx4iAkX3UeOBWGCp3rDS99ZUs3QvsO2TIXQbsaatq6HyPtS13s-nADd3s_qeSe4Mw1p6Uh3fGhnJ3jcPsQQNQ3QUxA6pq-ax7x4Pmb1YW9OZvg'

  console.log(params)
    try {
        const result = await initScheduler(params.token || token);
        console.log('Respuesta API Huawei:', result);
      } catch (error) {
        console.error('Error al ejecutar ServiceKpiRealtime:', error);
      }
};

app();