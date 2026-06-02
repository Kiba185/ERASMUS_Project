import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model TimeTable
 *
 */
export type TimeTableModel = runtime.Types.Result.DefaultSelection<Prisma.$TimeTablePayload>;
export type AggregateTimeTable = {
    _count: TimeTableCountAggregateOutputType | null;
    _avg: TimeTableAvgAggregateOutputType | null;
    _sum: TimeTableSumAggregateOutputType | null;
    _min: TimeTableMinAggregateOutputType | null;
    _max: TimeTableMaxAggregateOutputType | null;
};
export type TimeTableAvgAggregateOutputType = {
    id: number | null;
    periodNumber: number | null;
    subjectId: number | null;
    teacherId: number | null;
    classId: number | null;
};
export type TimeTableSumAggregateOutputType = {
    id: number | null;
    periodNumber: number | null;
    subjectId: number | null;
    teacherId: number | null;
    classId: number | null;
};
export type TimeTableMinAggregateOutputType = {
    id: number | null;
    day: string | null;
    startTime: string | null;
    endTime: string | null;
    periodNumber: number | null;
    room: string | null;
    subjectId: number | null;
    teacherId: number | null;
    classId: number | null;
};
export type TimeTableMaxAggregateOutputType = {
    id: number | null;
    day: string | null;
    startTime: string | null;
    endTime: string | null;
    periodNumber: number | null;
    room: string | null;
    subjectId: number | null;
    teacherId: number | null;
    classId: number | null;
};
export type TimeTableCountAggregateOutputType = {
    id: number;
    day: number;
    startTime: number;
    endTime: number;
    periodNumber: number;
    room: number;
    subjectId: number;
    teacherId: number;
    classId: number;
    _all: number;
};
export type TimeTableAvgAggregateInputType = {
    id?: true;
    periodNumber?: true;
    subjectId?: true;
    teacherId?: true;
    classId?: true;
};
export type TimeTableSumAggregateInputType = {
    id?: true;
    periodNumber?: true;
    subjectId?: true;
    teacherId?: true;
    classId?: true;
};
export type TimeTableMinAggregateInputType = {
    id?: true;
    day?: true;
    startTime?: true;
    endTime?: true;
    periodNumber?: true;
    room?: true;
    subjectId?: true;
    teacherId?: true;
    classId?: true;
};
export type TimeTableMaxAggregateInputType = {
    id?: true;
    day?: true;
    startTime?: true;
    endTime?: true;
    periodNumber?: true;
    room?: true;
    subjectId?: true;
    teacherId?: true;
    classId?: true;
};
export type TimeTableCountAggregateInputType = {
    id?: true;
    day?: true;
    startTime?: true;
    endTime?: true;
    periodNumber?: true;
    room?: true;
    subjectId?: true;
    teacherId?: true;
    classId?: true;
    _all?: true;
};
export type TimeTableAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TimeTable to aggregate.
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeTables to fetch.
     */
    orderBy?: Prisma.TimeTableOrderByWithRelationInput | Prisma.TimeTableOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.TimeTableWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeTables from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeTables.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned TimeTables
    **/
    _count?: true | TimeTableCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: TimeTableAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: TimeTableSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: TimeTableMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: TimeTableMaxAggregateInputType;
};
export type GetTimeTableAggregateType<T extends TimeTableAggregateArgs> = {
    [P in keyof T & keyof AggregateTimeTable]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTimeTable[P]> : Prisma.GetScalarType<T[P], AggregateTimeTable[P]>;
};
export type TimeTableGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TimeTableWhereInput;
    orderBy?: Prisma.TimeTableOrderByWithAggregationInput | Prisma.TimeTableOrderByWithAggregationInput[];
    by: Prisma.TimeTableScalarFieldEnum[] | Prisma.TimeTableScalarFieldEnum;
    having?: Prisma.TimeTableScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TimeTableCountAggregateInputType | true;
    _avg?: TimeTableAvgAggregateInputType;
    _sum?: TimeTableSumAggregateInputType;
    _min?: TimeTableMinAggregateInputType;
    _max?: TimeTableMaxAggregateInputType;
};
export type TimeTableGroupByOutputType = {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    teacherId: number;
    classId: number;
    _count: TimeTableCountAggregateOutputType | null;
    _avg: TimeTableAvgAggregateOutputType | null;
    _sum: TimeTableSumAggregateOutputType | null;
    _min: TimeTableMinAggregateOutputType | null;
    _max: TimeTableMaxAggregateOutputType | null;
};
export type GetTimeTableGroupByPayload<T extends TimeTableGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TimeTableGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TimeTableGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TimeTableGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TimeTableGroupByOutputType[P]>;
}>>;
export type TimeTableWhereInput = {
    AND?: Prisma.TimeTableWhereInput | Prisma.TimeTableWhereInput[];
    OR?: Prisma.TimeTableWhereInput[];
    NOT?: Prisma.TimeTableWhereInput | Prisma.TimeTableWhereInput[];
    id?: Prisma.IntFilter<"TimeTable"> | number;
    day?: Prisma.StringFilter<"TimeTable"> | string;
    startTime?: Prisma.StringFilter<"TimeTable"> | string;
    endTime?: Prisma.StringFilter<"TimeTable"> | string;
    periodNumber?: Prisma.IntFilter<"TimeTable"> | number;
    room?: Prisma.StringFilter<"TimeTable"> | string;
    subjectId?: Prisma.IntFilter<"TimeTable"> | number;
    teacherId?: Prisma.IntFilter<"TimeTable"> | number;
    classId?: Prisma.IntFilter<"TimeTable"> | number;
    subject?: Prisma.XOR<Prisma.SubjectScalarRelationFilter, Prisma.SubjectWhereInput>;
    teacher?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
};
export type TimeTableOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    day?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    room?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    subject?: Prisma.SubjectOrderByWithRelationInput;
    teacher?: Prisma.UserOrderByWithRelationInput;
    class?: Prisma.ClassOrderByWithRelationInput;
};
export type TimeTableWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.TimeTableWhereInput | Prisma.TimeTableWhereInput[];
    OR?: Prisma.TimeTableWhereInput[];
    NOT?: Prisma.TimeTableWhereInput | Prisma.TimeTableWhereInput[];
    day?: Prisma.StringFilter<"TimeTable"> | string;
    startTime?: Prisma.StringFilter<"TimeTable"> | string;
    endTime?: Prisma.StringFilter<"TimeTable"> | string;
    periodNumber?: Prisma.IntFilter<"TimeTable"> | number;
    room?: Prisma.StringFilter<"TimeTable"> | string;
    subjectId?: Prisma.IntFilter<"TimeTable"> | number;
    teacherId?: Prisma.IntFilter<"TimeTable"> | number;
    classId?: Prisma.IntFilter<"TimeTable"> | number;
    subject?: Prisma.XOR<Prisma.SubjectScalarRelationFilter, Prisma.SubjectWhereInput>;
    teacher?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
}, "id">;
export type TimeTableOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    day?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    room?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    _count?: Prisma.TimeTableCountOrderByAggregateInput;
    _avg?: Prisma.TimeTableAvgOrderByAggregateInput;
    _max?: Prisma.TimeTableMaxOrderByAggregateInput;
    _min?: Prisma.TimeTableMinOrderByAggregateInput;
    _sum?: Prisma.TimeTableSumOrderByAggregateInput;
};
export type TimeTableScalarWhereWithAggregatesInput = {
    AND?: Prisma.TimeTableScalarWhereWithAggregatesInput | Prisma.TimeTableScalarWhereWithAggregatesInput[];
    OR?: Prisma.TimeTableScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TimeTableScalarWhereWithAggregatesInput | Prisma.TimeTableScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"TimeTable"> | number;
    day?: Prisma.StringWithAggregatesFilter<"TimeTable"> | string;
    startTime?: Prisma.StringWithAggregatesFilter<"TimeTable"> | string;
    endTime?: Prisma.StringWithAggregatesFilter<"TimeTable"> | string;
    periodNumber?: Prisma.IntWithAggregatesFilter<"TimeTable"> | number;
    room?: Prisma.StringWithAggregatesFilter<"TimeTable"> | string;
    subjectId?: Prisma.IntWithAggregatesFilter<"TimeTable"> | number;
    teacherId?: Prisma.IntWithAggregatesFilter<"TimeTable"> | number;
    classId?: Prisma.IntWithAggregatesFilter<"TimeTable"> | number;
};
export type TimeTableCreateInput = {
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subject: Prisma.SubjectCreateNestedOneWithoutTimeTablesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTimeTablesInput;
    class: Prisma.ClassCreateNestedOneWithoutTimeTablesInput;
};
export type TimeTableUncheckedCreateInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    teacherId: number;
    classId: number;
};
export type TimeTableUpdateInput = {
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subject?: Prisma.SubjectUpdateOneRequiredWithoutTimeTablesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTimeTablesNestedInput;
    class?: Prisma.ClassUpdateOneRequiredWithoutTimeTablesNestedInput;
};
export type TimeTableUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableCreateManyInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    teacherId: number;
    classId: number;
};
export type TimeTableUpdateManyMutationInput = {
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type TimeTableUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableListRelationFilter = {
    every?: Prisma.TimeTableWhereInput;
    some?: Prisma.TimeTableWhereInput;
    none?: Prisma.TimeTableWhereInput;
};
export type TimeTableOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TimeTableCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    day?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    room?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
};
export type TimeTableAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
};
export type TimeTableMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    day?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    room?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
};
export type TimeTableMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    day?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    room?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
};
export type TimeTableSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    periodNumber?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
};
export type TimeTableCreateNestedManyWithoutTeacherInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput> | Prisma.TimeTableCreateWithoutTeacherInput[] | Prisma.TimeTableUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutTeacherInput | Prisma.TimeTableCreateOrConnectWithoutTeacherInput[];
    createMany?: Prisma.TimeTableCreateManyTeacherInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUncheckedCreateNestedManyWithoutTeacherInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput> | Prisma.TimeTableCreateWithoutTeacherInput[] | Prisma.TimeTableUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutTeacherInput | Prisma.TimeTableCreateOrConnectWithoutTeacherInput[];
    createMany?: Prisma.TimeTableCreateManyTeacherInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUpdateManyWithoutTeacherNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput> | Prisma.TimeTableCreateWithoutTeacherInput[] | Prisma.TimeTableUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutTeacherInput | Prisma.TimeTableCreateOrConnectWithoutTeacherInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutTeacherInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutTeacherInput[];
    createMany?: Prisma.TimeTableCreateManyTeacherInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutTeacherInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutTeacherInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutTeacherInput | Prisma.TimeTableUpdateManyWithWhereWithoutTeacherInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableUncheckedUpdateManyWithoutTeacherNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput> | Prisma.TimeTableCreateWithoutTeacherInput[] | Prisma.TimeTableUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutTeacherInput | Prisma.TimeTableCreateOrConnectWithoutTeacherInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutTeacherInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutTeacherInput[];
    createMany?: Prisma.TimeTableCreateManyTeacherInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutTeacherInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutTeacherInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutTeacherInput | Prisma.TimeTableUpdateManyWithWhereWithoutTeacherInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableCreateNestedManyWithoutSubjectInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput> | Prisma.TimeTableCreateWithoutSubjectInput[] | Prisma.TimeTableUncheckedCreateWithoutSubjectInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutSubjectInput | Prisma.TimeTableCreateOrConnectWithoutSubjectInput[];
    createMany?: Prisma.TimeTableCreateManySubjectInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUncheckedCreateNestedManyWithoutSubjectInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput> | Prisma.TimeTableCreateWithoutSubjectInput[] | Prisma.TimeTableUncheckedCreateWithoutSubjectInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutSubjectInput | Prisma.TimeTableCreateOrConnectWithoutSubjectInput[];
    createMany?: Prisma.TimeTableCreateManySubjectInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUpdateManyWithoutSubjectNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput> | Prisma.TimeTableCreateWithoutSubjectInput[] | Prisma.TimeTableUncheckedCreateWithoutSubjectInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutSubjectInput | Prisma.TimeTableCreateOrConnectWithoutSubjectInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutSubjectInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutSubjectInput[];
    createMany?: Prisma.TimeTableCreateManySubjectInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutSubjectInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutSubjectInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutSubjectInput | Prisma.TimeTableUpdateManyWithWhereWithoutSubjectInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableUncheckedUpdateManyWithoutSubjectNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput> | Prisma.TimeTableCreateWithoutSubjectInput[] | Prisma.TimeTableUncheckedCreateWithoutSubjectInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutSubjectInput | Prisma.TimeTableCreateOrConnectWithoutSubjectInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutSubjectInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutSubjectInput[];
    createMany?: Prisma.TimeTableCreateManySubjectInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutSubjectInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutSubjectInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutSubjectInput | Prisma.TimeTableUpdateManyWithWhereWithoutSubjectInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput> | Prisma.TimeTableCreateWithoutClassInput[] | Prisma.TimeTableUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutClassInput | Prisma.TimeTableCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.TimeTableCreateManyClassInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUncheckedCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput> | Prisma.TimeTableCreateWithoutClassInput[] | Prisma.TimeTableUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutClassInput | Prisma.TimeTableCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.TimeTableCreateManyClassInputEnvelope;
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
};
export type TimeTableUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput> | Prisma.TimeTableCreateWithoutClassInput[] | Prisma.TimeTableUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutClassInput | Prisma.TimeTableCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutClassInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.TimeTableCreateManyClassInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutClassInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutClassInput | Prisma.TimeTableUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableUncheckedUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput> | Prisma.TimeTableCreateWithoutClassInput[] | Prisma.TimeTableUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.TimeTableCreateOrConnectWithoutClassInput | Prisma.TimeTableCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.TimeTableUpsertWithWhereUniqueWithoutClassInput | Prisma.TimeTableUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.TimeTableCreateManyClassInputEnvelope;
    set?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    disconnect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    delete?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    connect?: Prisma.TimeTableWhereUniqueInput | Prisma.TimeTableWhereUniqueInput[];
    update?: Prisma.TimeTableUpdateWithWhereUniqueWithoutClassInput | Prisma.TimeTableUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.TimeTableUpdateManyWithWhereWithoutClassInput | Prisma.TimeTableUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
};
export type TimeTableCreateWithoutTeacherInput = {
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subject: Prisma.SubjectCreateNestedOneWithoutTimeTablesInput;
    class: Prisma.ClassCreateNestedOneWithoutTimeTablesInput;
};
export type TimeTableUncheckedCreateWithoutTeacherInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    classId: number;
};
export type TimeTableCreateOrConnectWithoutTeacherInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput>;
};
export type TimeTableCreateManyTeacherInputEnvelope = {
    data: Prisma.TimeTableCreateManyTeacherInput | Prisma.TimeTableCreateManyTeacherInput[];
    skipDuplicates?: boolean;
};
export type TimeTableUpsertWithWhereUniqueWithoutTeacherInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    update: Prisma.XOR<Prisma.TimeTableUpdateWithoutTeacherInput, Prisma.TimeTableUncheckedUpdateWithoutTeacherInput>;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutTeacherInput, Prisma.TimeTableUncheckedCreateWithoutTeacherInput>;
};
export type TimeTableUpdateWithWhereUniqueWithoutTeacherInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateWithoutTeacherInput, Prisma.TimeTableUncheckedUpdateWithoutTeacherInput>;
};
export type TimeTableUpdateManyWithWhereWithoutTeacherInput = {
    where: Prisma.TimeTableScalarWhereInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateManyMutationInput, Prisma.TimeTableUncheckedUpdateManyWithoutTeacherInput>;
};
export type TimeTableScalarWhereInput = {
    AND?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
    OR?: Prisma.TimeTableScalarWhereInput[];
    NOT?: Prisma.TimeTableScalarWhereInput | Prisma.TimeTableScalarWhereInput[];
    id?: Prisma.IntFilter<"TimeTable"> | number;
    day?: Prisma.StringFilter<"TimeTable"> | string;
    startTime?: Prisma.StringFilter<"TimeTable"> | string;
    endTime?: Prisma.StringFilter<"TimeTable"> | string;
    periodNumber?: Prisma.IntFilter<"TimeTable"> | number;
    room?: Prisma.StringFilter<"TimeTable"> | string;
    subjectId?: Prisma.IntFilter<"TimeTable"> | number;
    teacherId?: Prisma.IntFilter<"TimeTable"> | number;
    classId?: Prisma.IntFilter<"TimeTable"> | number;
};
export type TimeTableCreateWithoutSubjectInput = {
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    teacher: Prisma.UserCreateNestedOneWithoutTimeTablesInput;
    class: Prisma.ClassCreateNestedOneWithoutTimeTablesInput;
};
export type TimeTableUncheckedCreateWithoutSubjectInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    teacherId: number;
    classId: number;
};
export type TimeTableCreateOrConnectWithoutSubjectInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput>;
};
export type TimeTableCreateManySubjectInputEnvelope = {
    data: Prisma.TimeTableCreateManySubjectInput | Prisma.TimeTableCreateManySubjectInput[];
    skipDuplicates?: boolean;
};
export type TimeTableUpsertWithWhereUniqueWithoutSubjectInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    update: Prisma.XOR<Prisma.TimeTableUpdateWithoutSubjectInput, Prisma.TimeTableUncheckedUpdateWithoutSubjectInput>;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutSubjectInput, Prisma.TimeTableUncheckedCreateWithoutSubjectInput>;
};
export type TimeTableUpdateWithWhereUniqueWithoutSubjectInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateWithoutSubjectInput, Prisma.TimeTableUncheckedUpdateWithoutSubjectInput>;
};
export type TimeTableUpdateManyWithWhereWithoutSubjectInput = {
    where: Prisma.TimeTableScalarWhereInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateManyMutationInput, Prisma.TimeTableUncheckedUpdateManyWithoutSubjectInput>;
};
export type TimeTableCreateWithoutClassInput = {
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subject: Prisma.SubjectCreateNestedOneWithoutTimeTablesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTimeTablesInput;
};
export type TimeTableUncheckedCreateWithoutClassInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    teacherId: number;
};
export type TimeTableCreateOrConnectWithoutClassInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput>;
};
export type TimeTableCreateManyClassInputEnvelope = {
    data: Prisma.TimeTableCreateManyClassInput | Prisma.TimeTableCreateManyClassInput[];
    skipDuplicates?: boolean;
};
export type TimeTableUpsertWithWhereUniqueWithoutClassInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    update: Prisma.XOR<Prisma.TimeTableUpdateWithoutClassInput, Prisma.TimeTableUncheckedUpdateWithoutClassInput>;
    create: Prisma.XOR<Prisma.TimeTableCreateWithoutClassInput, Prisma.TimeTableUncheckedCreateWithoutClassInput>;
};
export type TimeTableUpdateWithWhereUniqueWithoutClassInput = {
    where: Prisma.TimeTableWhereUniqueInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateWithoutClassInput, Prisma.TimeTableUncheckedUpdateWithoutClassInput>;
};
export type TimeTableUpdateManyWithWhereWithoutClassInput = {
    where: Prisma.TimeTableScalarWhereInput;
    data: Prisma.XOR<Prisma.TimeTableUpdateManyMutationInput, Prisma.TimeTableUncheckedUpdateManyWithoutClassInput>;
};
export type TimeTableCreateManyTeacherInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    classId: number;
};
export type TimeTableUpdateWithoutTeacherInput = {
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subject?: Prisma.SubjectUpdateOneRequiredWithoutTimeTablesNestedInput;
    class?: Prisma.ClassUpdateOneRequiredWithoutTimeTablesNestedInput;
};
export type TimeTableUncheckedUpdateWithoutTeacherInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableUncheckedUpdateManyWithoutTeacherInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableCreateManySubjectInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    teacherId: number;
    classId: number;
};
export type TimeTableUpdateWithoutSubjectInput = {
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTimeTablesNestedInput;
    class?: Prisma.ClassUpdateOneRequiredWithoutTimeTablesNestedInput;
};
export type TimeTableUncheckedUpdateWithoutSubjectInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableUncheckedUpdateManyWithoutSubjectInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    classId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableCreateManyClassInput = {
    id?: number;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    room: string;
    subjectId: number;
    teacherId: number;
};
export type TimeTableUpdateWithoutClassInput = {
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subject?: Prisma.SubjectUpdateOneRequiredWithoutTimeTablesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTimeTablesNestedInput;
};
export type TimeTableUncheckedUpdateWithoutClassInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableUncheckedUpdateManyWithoutClassInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    day?: Prisma.StringFieldUpdateOperationsInput | string;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    periodNumber?: Prisma.IntFieldUpdateOperationsInput | number;
    room?: Prisma.StringFieldUpdateOperationsInput | string;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    teacherId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type TimeTableSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    day?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    periodNumber?: boolean;
    room?: boolean;
    subjectId?: boolean;
    teacherId?: boolean;
    classId?: boolean;
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["timeTable"]>;
export type TimeTableSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    day?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    periodNumber?: boolean;
    room?: boolean;
    subjectId?: boolean;
    teacherId?: boolean;
    classId?: boolean;
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["timeTable"]>;
export type TimeTableSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    day?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    periodNumber?: boolean;
    room?: boolean;
    subjectId?: boolean;
    teacherId?: boolean;
    classId?: boolean;
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["timeTable"]>;
export type TimeTableSelectScalar = {
    id?: boolean;
    day?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    periodNumber?: boolean;
    room?: boolean;
    subjectId?: boolean;
    teacherId?: boolean;
    classId?: boolean;
};
export type TimeTableOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "day" | "startTime" | "endTime" | "periodNumber" | "room" | "subjectId" | "teacherId" | "classId", ExtArgs["result"]["timeTable"]>;
export type TimeTableInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
};
export type TimeTableIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
};
export type TimeTableIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    subject?: boolean | Prisma.SubjectDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
};
export type $TimeTablePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TimeTable";
    objects: {
        subject: Prisma.$SubjectPayload<ExtArgs>;
        teacher: Prisma.$UserPayload<ExtArgs>;
        class: Prisma.$ClassPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        day: string;
        startTime: string;
        endTime: string;
        periodNumber: number;
        room: string;
        subjectId: number;
        teacherId: number;
        classId: number;
    }, ExtArgs["result"]["timeTable"]>;
    composites: {};
};
export type TimeTableGetPayload<S extends boolean | null | undefined | TimeTableDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TimeTablePayload, S>;
export type TimeTableCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TimeTableFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TimeTableCountAggregateInputType | true;
};
export interface TimeTableDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TimeTable'];
        meta: {
            name: 'TimeTable';
        };
    };
    /**
     * Find zero or one TimeTable that matches the filter.
     * @param {TimeTableFindUniqueArgs} args - Arguments to find a TimeTable
     * @example
     * // Get one TimeTable
     * const timeTable = await prisma.timeTable.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TimeTableFindUniqueArgs>(args: Prisma.SelectSubset<T, TimeTableFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one TimeTable that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TimeTableFindUniqueOrThrowArgs} args - Arguments to find a TimeTable
     * @example
     * // Get one TimeTable
     * const timeTable = await prisma.timeTable.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TimeTableFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TimeTableFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TimeTable that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableFindFirstArgs} args - Arguments to find a TimeTable
     * @example
     * // Get one TimeTable
     * const timeTable = await prisma.timeTable.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TimeTableFindFirstArgs>(args?: Prisma.SelectSubset<T, TimeTableFindFirstArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first TimeTable that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableFindFirstOrThrowArgs} args - Arguments to find a TimeTable
     * @example
     * // Get one TimeTable
     * const timeTable = await prisma.timeTable.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TimeTableFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TimeTableFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more TimeTables that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TimeTables
     * const timeTables = await prisma.timeTable.findMany()
     *
     * // Get first 10 TimeTables
     * const timeTables = await prisma.timeTable.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const timeTableWithIdOnly = await prisma.timeTable.findMany({ select: { id: true } })
     *
     */
    findMany<T extends TimeTableFindManyArgs>(args?: Prisma.SelectSubset<T, TimeTableFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a TimeTable.
     * @param {TimeTableCreateArgs} args - Arguments to create a TimeTable.
     * @example
     * // Create one TimeTable
     * const TimeTable = await prisma.timeTable.create({
     *   data: {
     *     // ... data to create a TimeTable
     *   }
     * })
     *
     */
    create<T extends TimeTableCreateArgs>(args: Prisma.SelectSubset<T, TimeTableCreateArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many TimeTables.
     * @param {TimeTableCreateManyArgs} args - Arguments to create many TimeTables.
     * @example
     * // Create many TimeTables
     * const timeTable = await prisma.timeTable.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends TimeTableCreateManyArgs>(args?: Prisma.SelectSubset<T, TimeTableCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many TimeTables and returns the data saved in the database.
     * @param {TimeTableCreateManyAndReturnArgs} args - Arguments to create many TimeTables.
     * @example
     * // Create many TimeTables
     * const timeTable = await prisma.timeTable.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many TimeTables and only return the `id`
     * const timeTableWithIdOnly = await prisma.timeTable.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends TimeTableCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TimeTableCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a TimeTable.
     * @param {TimeTableDeleteArgs} args - Arguments to delete one TimeTable.
     * @example
     * // Delete one TimeTable
     * const TimeTable = await prisma.timeTable.delete({
     *   where: {
     *     // ... filter to delete one TimeTable
     *   }
     * })
     *
     */
    delete<T extends TimeTableDeleteArgs>(args: Prisma.SelectSubset<T, TimeTableDeleteArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one TimeTable.
     * @param {TimeTableUpdateArgs} args - Arguments to update one TimeTable.
     * @example
     * // Update one TimeTable
     * const timeTable = await prisma.timeTable.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends TimeTableUpdateArgs>(args: Prisma.SelectSubset<T, TimeTableUpdateArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more TimeTables.
     * @param {TimeTableDeleteManyArgs} args - Arguments to filter TimeTables to delete.
     * @example
     * // Delete a few TimeTables
     * const { count } = await prisma.timeTable.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends TimeTableDeleteManyArgs>(args?: Prisma.SelectSubset<T, TimeTableDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TimeTables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TimeTables
     * const timeTable = await prisma.timeTable.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends TimeTableUpdateManyArgs>(args: Prisma.SelectSubset<T, TimeTableUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more TimeTables and returns the data updated in the database.
     * @param {TimeTableUpdateManyAndReturnArgs} args - Arguments to update many TimeTables.
     * @example
     * // Update many TimeTables
     * const timeTable = await prisma.timeTable.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more TimeTables and only return the `id`
     * const timeTableWithIdOnly = await prisma.timeTable.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends TimeTableUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TimeTableUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one TimeTable.
     * @param {TimeTableUpsertArgs} args - Arguments to update or create a TimeTable.
     * @example
     * // Update or create a TimeTable
     * const timeTable = await prisma.timeTable.upsert({
     *   create: {
     *     // ... data to create a TimeTable
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TimeTable we want to update
     *   }
     * })
     */
    upsert<T extends TimeTableUpsertArgs>(args: Prisma.SelectSubset<T, TimeTableUpsertArgs<ExtArgs>>): Prisma.Prisma__TimeTableClient<runtime.Types.Result.GetResult<Prisma.$TimeTablePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of TimeTables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableCountArgs} args - Arguments to filter TimeTables to count.
     * @example
     * // Count the number of TimeTables
     * const count = await prisma.timeTable.count({
     *   where: {
     *     // ... the filter for the TimeTables we want to count
     *   }
     * })
    **/
    count<T extends TimeTableCountArgs>(args?: Prisma.Subset<T, TimeTableCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TimeTableCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a TimeTable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TimeTableAggregateArgs>(args: Prisma.Subset<T, TimeTableAggregateArgs>): Prisma.PrismaPromise<GetTimeTableAggregateType<T>>;
    /**
     * Group by TimeTable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TimeTableGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends TimeTableGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TimeTableGroupByArgs['orderBy'];
    } : {
        orderBy?: TimeTableGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TimeTableGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTimeTableGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the TimeTable model
     */
    readonly fields: TimeTableFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for TimeTable.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__TimeTableClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    subject<T extends Prisma.SubjectDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.SubjectDefaultArgs<ExtArgs>>): Prisma.Prisma__SubjectClient<runtime.Types.Result.GetResult<Prisma.$SubjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    teacher<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    class<T extends Prisma.ClassDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the TimeTable model
 */
export interface TimeTableFieldRefs {
    readonly id: Prisma.FieldRef<"TimeTable", 'Int'>;
    readonly day: Prisma.FieldRef<"TimeTable", 'String'>;
    readonly startTime: Prisma.FieldRef<"TimeTable", 'String'>;
    readonly endTime: Prisma.FieldRef<"TimeTable", 'String'>;
    readonly periodNumber: Prisma.FieldRef<"TimeTable", 'Int'>;
    readonly room: Prisma.FieldRef<"TimeTable", 'String'>;
    readonly subjectId: Prisma.FieldRef<"TimeTable", 'Int'>;
    readonly teacherId: Prisma.FieldRef<"TimeTable", 'Int'>;
    readonly classId: Prisma.FieldRef<"TimeTable", 'Int'>;
}
/**
 * TimeTable findUnique
 */
export type TimeTableFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter, which TimeTable to fetch.
     */
    where: Prisma.TimeTableWhereUniqueInput;
};
/**
 * TimeTable findUniqueOrThrow
 */
export type TimeTableFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter, which TimeTable to fetch.
     */
    where: Prisma.TimeTableWhereUniqueInput;
};
/**
 * TimeTable findFirst
 */
export type TimeTableFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter, which TimeTable to fetch.
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeTables to fetch.
     */
    orderBy?: Prisma.TimeTableOrderByWithRelationInput | Prisma.TimeTableOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TimeTables.
     */
    cursor?: Prisma.TimeTableWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeTables from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeTables.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TimeTables.
     */
    distinct?: Prisma.TimeTableScalarFieldEnum | Prisma.TimeTableScalarFieldEnum[];
};
/**
 * TimeTable findFirstOrThrow
 */
export type TimeTableFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter, which TimeTable to fetch.
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeTables to fetch.
     */
    orderBy?: Prisma.TimeTableOrderByWithRelationInput | Prisma.TimeTableOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for TimeTables.
     */
    cursor?: Prisma.TimeTableWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeTables from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeTables.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TimeTables.
     */
    distinct?: Prisma.TimeTableScalarFieldEnum | Prisma.TimeTableScalarFieldEnum[];
};
/**
 * TimeTable findMany
 */
export type TimeTableFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter, which TimeTables to fetch.
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of TimeTables to fetch.
     */
    orderBy?: Prisma.TimeTableOrderByWithRelationInput | Prisma.TimeTableOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing TimeTables.
     */
    cursor?: Prisma.TimeTableWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` TimeTables from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` TimeTables.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of TimeTables.
     */
    distinct?: Prisma.TimeTableScalarFieldEnum | Prisma.TimeTableScalarFieldEnum[];
};
/**
 * TimeTable create
 */
export type TimeTableCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * The data needed to create a TimeTable.
     */
    data: Prisma.XOR<Prisma.TimeTableCreateInput, Prisma.TimeTableUncheckedCreateInput>;
};
/**
 * TimeTable createMany
 */
export type TimeTableCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many TimeTables.
     */
    data: Prisma.TimeTableCreateManyInput | Prisma.TimeTableCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * TimeTable createManyAndReturn
 */
export type TimeTableCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * The data used to create many TimeTables.
     */
    data: Prisma.TimeTableCreateManyInput | Prisma.TimeTableCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * TimeTable update
 */
export type TimeTableUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * The data needed to update a TimeTable.
     */
    data: Prisma.XOR<Prisma.TimeTableUpdateInput, Prisma.TimeTableUncheckedUpdateInput>;
    /**
     * Choose, which TimeTable to update.
     */
    where: Prisma.TimeTableWhereUniqueInput;
};
/**
 * TimeTable updateMany
 */
export type TimeTableUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update TimeTables.
     */
    data: Prisma.XOR<Prisma.TimeTableUpdateManyMutationInput, Prisma.TimeTableUncheckedUpdateManyInput>;
    /**
     * Filter which TimeTables to update
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * Limit how many TimeTables to update.
     */
    limit?: number;
};
/**
 * TimeTable updateManyAndReturn
 */
export type TimeTableUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * The data used to update TimeTables.
     */
    data: Prisma.XOR<Prisma.TimeTableUpdateManyMutationInput, Prisma.TimeTableUncheckedUpdateManyInput>;
    /**
     * Filter which TimeTables to update
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * Limit how many TimeTables to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * TimeTable upsert
 */
export type TimeTableUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * The filter to search for the TimeTable to update in case it exists.
     */
    where: Prisma.TimeTableWhereUniqueInput;
    /**
     * In case the TimeTable found by the `where` argument doesn't exist, create a new TimeTable with this data.
     */
    create: Prisma.XOR<Prisma.TimeTableCreateInput, Prisma.TimeTableUncheckedCreateInput>;
    /**
     * In case the TimeTable was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.TimeTableUpdateInput, Prisma.TimeTableUncheckedUpdateInput>;
};
/**
 * TimeTable delete
 */
export type TimeTableDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
    /**
     * Filter which TimeTable to delete.
     */
    where: Prisma.TimeTableWhereUniqueInput;
};
/**
 * TimeTable deleteMany
 */
export type TimeTableDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which TimeTables to delete
     */
    where?: Prisma.TimeTableWhereInput;
    /**
     * Limit how many TimeTables to delete.
     */
    limit?: number;
};
/**
 * TimeTable without action
 */
export type TimeTableDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TimeTable
     */
    select?: Prisma.TimeTableSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TimeTable
     */
    omit?: Prisma.TimeTableOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TimeTableInclude<ExtArgs> | null;
};
//# sourceMappingURL=TimeTable.d.ts.map