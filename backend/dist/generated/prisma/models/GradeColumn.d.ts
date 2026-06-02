import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model GradeColumn
 *
 */
export type GradeColumnModel = runtime.Types.Result.DefaultSelection<Prisma.$GradeColumnPayload>;
export type AggregateGradeColumn = {
    _count: GradeColumnCountAggregateOutputType | null;
    _avg: GradeColumnAvgAggregateOutputType | null;
    _sum: GradeColumnSumAggregateOutputType | null;
    _min: GradeColumnMinAggregateOutputType | null;
    _max: GradeColumnMaxAggregateOutputType | null;
};
export type GradeColumnAvgAggregateOutputType = {
    id: number | null;
    subjectId: number | null;
    TeacherId: number | null;
    weight: number | null;
};
export type GradeColumnSumAggregateOutputType = {
    id: number | null;
    subjectId: number | null;
    TeacherId: number | null;
    weight: number | null;
};
export type GradeColumnMinAggregateOutputType = {
    id: number | null;
    subjectId: number | null;
    TeacherId: number | null;
    name: string | null;
    weight: number | null;
    date: Date | null;
};
export type GradeColumnMaxAggregateOutputType = {
    id: number | null;
    subjectId: number | null;
    TeacherId: number | null;
    name: string | null;
    weight: number | null;
    date: Date | null;
};
export type GradeColumnCountAggregateOutputType = {
    id: number;
    subjectId: number;
    TeacherId: number;
    name: number;
    weight: number;
    date: number;
    _all: number;
};
export type GradeColumnAvgAggregateInputType = {
    id?: true;
    subjectId?: true;
    TeacherId?: true;
    weight?: true;
};
export type GradeColumnSumAggregateInputType = {
    id?: true;
    subjectId?: true;
    TeacherId?: true;
    weight?: true;
};
export type GradeColumnMinAggregateInputType = {
    id?: true;
    subjectId?: true;
    TeacherId?: true;
    name?: true;
    weight?: true;
    date?: true;
};
export type GradeColumnMaxAggregateInputType = {
    id?: true;
    subjectId?: true;
    TeacherId?: true;
    name?: true;
    weight?: true;
    date?: true;
};
export type GradeColumnCountAggregateInputType = {
    id?: true;
    subjectId?: true;
    TeacherId?: true;
    name?: true;
    weight?: true;
    date?: true;
    _all?: true;
};
export type GradeColumnAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GradeColumn to aggregate.
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GradeColumns to fetch.
     */
    orderBy?: Prisma.GradeColumnOrderByWithRelationInput | Prisma.GradeColumnOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GradeColumnWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GradeColumns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GradeColumns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GradeColumns
    **/
    _count?: true | GradeColumnCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: GradeColumnAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: GradeColumnSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GradeColumnMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GradeColumnMaxAggregateInputType;
};
export type GetGradeColumnAggregateType<T extends GradeColumnAggregateArgs> = {
    [P in keyof T & keyof AggregateGradeColumn]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGradeColumn[P]> : Prisma.GetScalarType<T[P], AggregateGradeColumn[P]>;
};
export type GradeColumnGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GradeColumnWhereInput;
    orderBy?: Prisma.GradeColumnOrderByWithAggregationInput | Prisma.GradeColumnOrderByWithAggregationInput[];
    by: Prisma.GradeColumnScalarFieldEnum[] | Prisma.GradeColumnScalarFieldEnum;
    having?: Prisma.GradeColumnScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GradeColumnCountAggregateInputType | true;
    _avg?: GradeColumnAvgAggregateInputType;
    _sum?: GradeColumnSumAggregateInputType;
    _min?: GradeColumnMinAggregateInputType;
    _max?: GradeColumnMaxAggregateInputType;
};
export type GradeColumnGroupByOutputType = {
    id: number;
    subjectId: number;
    TeacherId: number;
    name: string;
    weight: number;
    date: Date;
    _count: GradeColumnCountAggregateOutputType | null;
    _avg: GradeColumnAvgAggregateOutputType | null;
    _sum: GradeColumnSumAggregateOutputType | null;
    _min: GradeColumnMinAggregateOutputType | null;
    _max: GradeColumnMaxAggregateOutputType | null;
};
export type GetGradeColumnGroupByPayload<T extends GradeColumnGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GradeColumnGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GradeColumnGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GradeColumnGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GradeColumnGroupByOutputType[P]>;
}>>;
export type GradeColumnWhereInput = {
    AND?: Prisma.GradeColumnWhereInput | Prisma.GradeColumnWhereInput[];
    OR?: Prisma.GradeColumnWhereInput[];
    NOT?: Prisma.GradeColumnWhereInput | Prisma.GradeColumnWhereInput[];
    id?: Prisma.IntFilter<"GradeColumn"> | number;
    subjectId?: Prisma.IntFilter<"GradeColumn"> | number;
    TeacherId?: Prisma.IntFilter<"GradeColumn"> | number;
    name?: Prisma.StringFilter<"GradeColumn"> | string;
    weight?: Prisma.IntFilter<"GradeColumn"> | number;
    date?: Prisma.DateTimeFilter<"GradeColumn"> | Date | string;
};
export type GradeColumnOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
};
export type GradeColumnWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.GradeColumnWhereInput | Prisma.GradeColumnWhereInput[];
    OR?: Prisma.GradeColumnWhereInput[];
    NOT?: Prisma.GradeColumnWhereInput | Prisma.GradeColumnWhereInput[];
    subjectId?: Prisma.IntFilter<"GradeColumn"> | number;
    TeacherId?: Prisma.IntFilter<"GradeColumn"> | number;
    name?: Prisma.StringFilter<"GradeColumn"> | string;
    weight?: Prisma.IntFilter<"GradeColumn"> | number;
    date?: Prisma.DateTimeFilter<"GradeColumn"> | Date | string;
}, "id">;
export type GradeColumnOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    _count?: Prisma.GradeColumnCountOrderByAggregateInput;
    _avg?: Prisma.GradeColumnAvgOrderByAggregateInput;
    _max?: Prisma.GradeColumnMaxOrderByAggregateInput;
    _min?: Prisma.GradeColumnMinOrderByAggregateInput;
    _sum?: Prisma.GradeColumnSumOrderByAggregateInput;
};
export type GradeColumnScalarWhereWithAggregatesInput = {
    AND?: Prisma.GradeColumnScalarWhereWithAggregatesInput | Prisma.GradeColumnScalarWhereWithAggregatesInput[];
    OR?: Prisma.GradeColumnScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GradeColumnScalarWhereWithAggregatesInput | Prisma.GradeColumnScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"GradeColumn"> | number;
    subjectId?: Prisma.IntWithAggregatesFilter<"GradeColumn"> | number;
    TeacherId?: Prisma.IntWithAggregatesFilter<"GradeColumn"> | number;
    name?: Prisma.StringWithAggregatesFilter<"GradeColumn"> | string;
    weight?: Prisma.IntWithAggregatesFilter<"GradeColumn"> | number;
    date?: Prisma.DateTimeWithAggregatesFilter<"GradeColumn"> | Date | string;
};
export type GradeColumnCreateInput = {
    subjectId: number;
    TeacherId: number;
    name: string;
    weight: number;
    date: Date | string;
};
export type GradeColumnUncheckedCreateInput = {
    id?: number;
    subjectId: number;
    TeacherId: number;
    name: string;
    weight: number;
    date: Date | string;
};
export type GradeColumnUpdateInput = {
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    TeacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    weight?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GradeColumnUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    TeacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    weight?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GradeColumnCreateManyInput = {
    id?: number;
    subjectId: number;
    TeacherId: number;
    name: string;
    weight: number;
    date: Date | string;
};
export type GradeColumnUpdateManyMutationInput = {
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    TeacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    weight?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GradeColumnUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    subjectId?: Prisma.IntFieldUpdateOperationsInput | number;
    TeacherId?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    weight?: Prisma.IntFieldUpdateOperationsInput | number;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GradeColumnCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
};
export type GradeColumnAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
};
export type GradeColumnMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
};
export type GradeColumnMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
};
export type GradeColumnSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    subjectId?: Prisma.SortOrder;
    TeacherId?: Prisma.SortOrder;
    weight?: Prisma.SortOrder;
};
export type GradeColumnSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    subjectId?: boolean;
    TeacherId?: boolean;
    name?: boolean;
    weight?: boolean;
    date?: boolean;
}, ExtArgs["result"]["gradeColumn"]>;
export type GradeColumnSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    subjectId?: boolean;
    TeacherId?: boolean;
    name?: boolean;
    weight?: boolean;
    date?: boolean;
}, ExtArgs["result"]["gradeColumn"]>;
export type GradeColumnSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    subjectId?: boolean;
    TeacherId?: boolean;
    name?: boolean;
    weight?: boolean;
    date?: boolean;
}, ExtArgs["result"]["gradeColumn"]>;
export type GradeColumnSelectScalar = {
    id?: boolean;
    subjectId?: boolean;
    TeacherId?: boolean;
    name?: boolean;
    weight?: boolean;
    date?: boolean;
};
export type GradeColumnOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "subjectId" | "TeacherId" | "name" | "weight" | "date", ExtArgs["result"]["gradeColumn"]>;
export type $GradeColumnPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GradeColumn";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        subjectId: number;
        TeacherId: number;
        name: string;
        weight: number;
        date: Date;
    }, ExtArgs["result"]["gradeColumn"]>;
    composites: {};
};
export type GradeColumnGetPayload<S extends boolean | null | undefined | GradeColumnDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload, S>;
export type GradeColumnCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GradeColumnFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GradeColumnCountAggregateInputType | true;
};
export interface GradeColumnDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GradeColumn'];
        meta: {
            name: 'GradeColumn';
        };
    };
    /**
     * Find zero or one GradeColumn that matches the filter.
     * @param {GradeColumnFindUniqueArgs} args - Arguments to find a GradeColumn
     * @example
     * // Get one GradeColumn
     * const gradeColumn = await prisma.gradeColumn.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GradeColumnFindUniqueArgs>(args: Prisma.SelectSubset<T, GradeColumnFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GradeColumn that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GradeColumnFindUniqueOrThrowArgs} args - Arguments to find a GradeColumn
     * @example
     * // Get one GradeColumn
     * const gradeColumn = await prisma.gradeColumn.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GradeColumnFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GradeColumnFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GradeColumn that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnFindFirstArgs} args - Arguments to find a GradeColumn
     * @example
     * // Get one GradeColumn
     * const gradeColumn = await prisma.gradeColumn.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GradeColumnFindFirstArgs>(args?: Prisma.SelectSubset<T, GradeColumnFindFirstArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GradeColumn that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnFindFirstOrThrowArgs} args - Arguments to find a GradeColumn
     * @example
     * // Get one GradeColumn
     * const gradeColumn = await prisma.gradeColumn.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GradeColumnFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GradeColumnFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GradeColumns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GradeColumns
     * const gradeColumns = await prisma.gradeColumn.findMany()
     *
     * // Get first 10 GradeColumns
     * const gradeColumns = await prisma.gradeColumn.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const gradeColumnWithIdOnly = await prisma.gradeColumn.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GradeColumnFindManyArgs>(args?: Prisma.SelectSubset<T, GradeColumnFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GradeColumn.
     * @param {GradeColumnCreateArgs} args - Arguments to create a GradeColumn.
     * @example
     * // Create one GradeColumn
     * const GradeColumn = await prisma.gradeColumn.create({
     *   data: {
     *     // ... data to create a GradeColumn
     *   }
     * })
     *
     */
    create<T extends GradeColumnCreateArgs>(args: Prisma.SelectSubset<T, GradeColumnCreateArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GradeColumns.
     * @param {GradeColumnCreateManyArgs} args - Arguments to create many GradeColumns.
     * @example
     * // Create many GradeColumns
     * const gradeColumn = await prisma.gradeColumn.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GradeColumnCreateManyArgs>(args?: Prisma.SelectSubset<T, GradeColumnCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GradeColumns and returns the data saved in the database.
     * @param {GradeColumnCreateManyAndReturnArgs} args - Arguments to create many GradeColumns.
     * @example
     * // Create many GradeColumns
     * const gradeColumn = await prisma.gradeColumn.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GradeColumns and only return the `id`
     * const gradeColumnWithIdOnly = await prisma.gradeColumn.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GradeColumnCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GradeColumnCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GradeColumn.
     * @param {GradeColumnDeleteArgs} args - Arguments to delete one GradeColumn.
     * @example
     * // Delete one GradeColumn
     * const GradeColumn = await prisma.gradeColumn.delete({
     *   where: {
     *     // ... filter to delete one GradeColumn
     *   }
     * })
     *
     */
    delete<T extends GradeColumnDeleteArgs>(args: Prisma.SelectSubset<T, GradeColumnDeleteArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GradeColumn.
     * @param {GradeColumnUpdateArgs} args - Arguments to update one GradeColumn.
     * @example
     * // Update one GradeColumn
     * const gradeColumn = await prisma.gradeColumn.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GradeColumnUpdateArgs>(args: Prisma.SelectSubset<T, GradeColumnUpdateArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GradeColumns.
     * @param {GradeColumnDeleteManyArgs} args - Arguments to filter GradeColumns to delete.
     * @example
     * // Delete a few GradeColumns
     * const { count } = await prisma.gradeColumn.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GradeColumnDeleteManyArgs>(args?: Prisma.SelectSubset<T, GradeColumnDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GradeColumns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GradeColumns
     * const gradeColumn = await prisma.gradeColumn.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GradeColumnUpdateManyArgs>(args: Prisma.SelectSubset<T, GradeColumnUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GradeColumns and returns the data updated in the database.
     * @param {GradeColumnUpdateManyAndReturnArgs} args - Arguments to update many GradeColumns.
     * @example
     * // Update many GradeColumns
     * const gradeColumn = await prisma.gradeColumn.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GradeColumns and only return the `id`
     * const gradeColumnWithIdOnly = await prisma.gradeColumn.updateManyAndReturn({
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
    updateManyAndReturn<T extends GradeColumnUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GradeColumnUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GradeColumn.
     * @param {GradeColumnUpsertArgs} args - Arguments to update or create a GradeColumn.
     * @example
     * // Update or create a GradeColumn
     * const gradeColumn = await prisma.gradeColumn.upsert({
     *   create: {
     *     // ... data to create a GradeColumn
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GradeColumn we want to update
     *   }
     * })
     */
    upsert<T extends GradeColumnUpsertArgs>(args: Prisma.SelectSubset<T, GradeColumnUpsertArgs<ExtArgs>>): Prisma.Prisma__GradeColumnClient<runtime.Types.Result.GetResult<Prisma.$GradeColumnPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GradeColumns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnCountArgs} args - Arguments to filter GradeColumns to count.
     * @example
     * // Count the number of GradeColumns
     * const count = await prisma.gradeColumn.count({
     *   where: {
     *     // ... the filter for the GradeColumns we want to count
     *   }
     * })
    **/
    count<T extends GradeColumnCountArgs>(args?: Prisma.Subset<T, GradeColumnCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GradeColumnCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GradeColumn.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GradeColumnAggregateArgs>(args: Prisma.Subset<T, GradeColumnAggregateArgs>): Prisma.PrismaPromise<GetGradeColumnAggregateType<T>>;
    /**
     * Group by GradeColumn.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GradeColumnGroupByArgs} args - Group by arguments.
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
    groupBy<T extends GradeColumnGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GradeColumnGroupByArgs['orderBy'];
    } : {
        orderBy?: GradeColumnGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GradeColumnGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGradeColumnGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GradeColumn model
     */
    readonly fields: GradeColumnFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GradeColumn.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GradeColumnClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the GradeColumn model
 */
export interface GradeColumnFieldRefs {
    readonly id: Prisma.FieldRef<"GradeColumn", 'Int'>;
    readonly subjectId: Prisma.FieldRef<"GradeColumn", 'Int'>;
    readonly TeacherId: Prisma.FieldRef<"GradeColumn", 'Int'>;
    readonly name: Prisma.FieldRef<"GradeColumn", 'String'>;
    readonly weight: Prisma.FieldRef<"GradeColumn", 'Int'>;
    readonly date: Prisma.FieldRef<"GradeColumn", 'DateTime'>;
}
/**
 * GradeColumn findUnique
 */
export type GradeColumnFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter, which GradeColumn to fetch.
     */
    where: Prisma.GradeColumnWhereUniqueInput;
};
/**
 * GradeColumn findUniqueOrThrow
 */
export type GradeColumnFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter, which GradeColumn to fetch.
     */
    where: Prisma.GradeColumnWhereUniqueInput;
};
/**
 * GradeColumn findFirst
 */
export type GradeColumnFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter, which GradeColumn to fetch.
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GradeColumns to fetch.
     */
    orderBy?: Prisma.GradeColumnOrderByWithRelationInput | Prisma.GradeColumnOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GradeColumns.
     */
    cursor?: Prisma.GradeColumnWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GradeColumns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GradeColumns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GradeColumns.
     */
    distinct?: Prisma.GradeColumnScalarFieldEnum | Prisma.GradeColumnScalarFieldEnum[];
};
/**
 * GradeColumn findFirstOrThrow
 */
export type GradeColumnFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter, which GradeColumn to fetch.
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GradeColumns to fetch.
     */
    orderBy?: Prisma.GradeColumnOrderByWithRelationInput | Prisma.GradeColumnOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GradeColumns.
     */
    cursor?: Prisma.GradeColumnWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GradeColumns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GradeColumns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GradeColumns.
     */
    distinct?: Prisma.GradeColumnScalarFieldEnum | Prisma.GradeColumnScalarFieldEnum[];
};
/**
 * GradeColumn findMany
 */
export type GradeColumnFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter, which GradeColumns to fetch.
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GradeColumns to fetch.
     */
    orderBy?: Prisma.GradeColumnOrderByWithRelationInput | Prisma.GradeColumnOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GradeColumns.
     */
    cursor?: Prisma.GradeColumnWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GradeColumns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GradeColumns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GradeColumns.
     */
    distinct?: Prisma.GradeColumnScalarFieldEnum | Prisma.GradeColumnScalarFieldEnum[];
};
/**
 * GradeColumn create
 */
export type GradeColumnCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * The data needed to create a GradeColumn.
     */
    data: Prisma.XOR<Prisma.GradeColumnCreateInput, Prisma.GradeColumnUncheckedCreateInput>;
};
/**
 * GradeColumn createMany
 */
export type GradeColumnCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GradeColumns.
     */
    data: Prisma.GradeColumnCreateManyInput | Prisma.GradeColumnCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GradeColumn createManyAndReturn
 */
export type GradeColumnCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * The data used to create many GradeColumns.
     */
    data: Prisma.GradeColumnCreateManyInput | Prisma.GradeColumnCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GradeColumn update
 */
export type GradeColumnUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * The data needed to update a GradeColumn.
     */
    data: Prisma.XOR<Prisma.GradeColumnUpdateInput, Prisma.GradeColumnUncheckedUpdateInput>;
    /**
     * Choose, which GradeColumn to update.
     */
    where: Prisma.GradeColumnWhereUniqueInput;
};
/**
 * GradeColumn updateMany
 */
export type GradeColumnUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GradeColumns.
     */
    data: Prisma.XOR<Prisma.GradeColumnUpdateManyMutationInput, Prisma.GradeColumnUncheckedUpdateManyInput>;
    /**
     * Filter which GradeColumns to update
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * Limit how many GradeColumns to update.
     */
    limit?: number;
};
/**
 * GradeColumn updateManyAndReturn
 */
export type GradeColumnUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * The data used to update GradeColumns.
     */
    data: Prisma.XOR<Prisma.GradeColumnUpdateManyMutationInput, Prisma.GradeColumnUncheckedUpdateManyInput>;
    /**
     * Filter which GradeColumns to update
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * Limit how many GradeColumns to update.
     */
    limit?: number;
};
/**
 * GradeColumn upsert
 */
export type GradeColumnUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * The filter to search for the GradeColumn to update in case it exists.
     */
    where: Prisma.GradeColumnWhereUniqueInput;
    /**
     * In case the GradeColumn found by the `where` argument doesn't exist, create a new GradeColumn with this data.
     */
    create: Prisma.XOR<Prisma.GradeColumnCreateInput, Prisma.GradeColumnUncheckedCreateInput>;
    /**
     * In case the GradeColumn was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GradeColumnUpdateInput, Prisma.GradeColumnUncheckedUpdateInput>;
};
/**
 * GradeColumn delete
 */
export type GradeColumnDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
    /**
     * Filter which GradeColumn to delete.
     */
    where: Prisma.GradeColumnWhereUniqueInput;
};
/**
 * GradeColumn deleteMany
 */
export type GradeColumnDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GradeColumns to delete
     */
    where?: Prisma.GradeColumnWhereInput;
    /**
     * Limit how many GradeColumns to delete.
     */
    limit?: number;
};
/**
 * GradeColumn without action
 */
export type GradeColumnDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GradeColumn
     */
    select?: Prisma.GradeColumnSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GradeColumn
     */
    omit?: Prisma.GradeColumnOmit<ExtArgs> | null;
};
//# sourceMappingURL=GradeColumn.d.ts.map